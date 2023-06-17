<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-searchbar type="text" v-model="search" placeholder="Search"></ion-searchbar>
        <ion-buttons slot="end" class="mobile-view">
          <ion-button @click="emit('dismissModal')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" ref="content">
      <div ref="scrollTrigger" class="scroll-trigger"></div>
      <div class="pl-4 pr-4">
        <!-- <label for="sort">Sort by:</label> -->
        <select id="sort" v-model="sortOrder" :inset="true" class="h-8 w-full">
          <option value="createdDesc">Newest</option>
          <option value="createdAsc">Oldest</option>
          <option value="wordAsc">A to Z</option>
          <option value="wordDesc">Z to A</option>
          <option value="bookmarked">Bookmarked</option>
          <option value="sourceCustom">Source: Custom list words</option>
          <option value="sourceProvided">Source: Provided list words</option>
        </select>
      </div>

      <ion-list id="modal-list" :inset="true" class="mt-2 pt-0 pb-0">
        <div v-if="sortedWords.length === 0" class="pl-2.5 pt-3.5 pb-3.5">(No results)</div>

        <RecycleScroller
          :key="recyclerKey"
          :items="sortedWords"
          :item-size="49"
          :buffer="520"
          key-field="word"
          v-slot="{ item, index }"
        >
          <ion-item
            button
            detail="false"
            :class="[getItemClass(index), getSelectedWordHighlight(item.word)]"
          >
            <ion-icon
              :icon="`${item.bookmarked ? star : starOutline}`"
              class="text-xl m-0 p-3 pl-4"
              slot="start"
              @click="handleBookmark(item)"
            ></ion-icon>

            <span @click="chooseWord(item)" class="flex items-center w-full h-full">{{
              item.word
            }}</span>

            <ion-icon
              :icon="trashOutline"
              class="text-lg m-0 p-3 pr-4"
              slot="end"
              @click="handleDeleteAlert(item)"
            ></ion-icon>
          </ion-item>
        </RecycleScroller>
      </ion-list>
    </ion-content>

    <ion-alert
      :is-open="isAlertOpen"
      class="custom-alert"
      header="Are you sure?"
      :buttons="alertButtons"
      @didDismiss="setAlertOpen(false)"
    ></ion-alert>

    <ion-toast
      :is-open="isToastOpen"
      message="Word deleted"
      :duration="3000"
      @didDismiss="setToastOpen(false)"
    ></ion-toast>

    <ion-fab vertical="bottom" horizontal="end">
      <!-- For the button to work in this modal, v-if="isVisible" needs to be placed below rather than in ion-fab above -->
      <ion-fab-button @click="scrollToTop" aria-label="Scroll to top" v-if="isVisible">
        <ion-icon :icon="arrowUp"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>
<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { PropType } from 'vue'
import type { WordObject } from '@/stores/modules/types/Review'
import { arrowUp, star, starOutline, trashOutline } from 'ionicons/icons'
import {
  IonHeader,
  IonToolbar,
  IonPage,
  IonSearchbar,
  IonContent,
  IonList,
  IonItem,
  IonTitle,
  IonButtons,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonAlert,
  IonToast
} from '@ionic/vue'
import { db, user } from '@/firebaseInit'
import { doc, updateDoc, arrayRemove } from 'firebase/firestore'
import { useReviewStore } from '@/stores/index.ts'

const store = useReviewStore()

const props = defineProps({
  allWords: { type: Array as PropType<WordObject[]>, required: true },
  selectedWord: { type: Object as PropType<WordObject> }
})

const emit = defineEmits(['selectWord', 'dismissModal', 'wordDeleted'])
const chooseWord = (word: WordObject) => {
  emit('selectWord', word)
  emit('dismissModal')
}

// NOTE this key is needed for the list to change reactively whenever the order of the list is changed or when a word is deleted from the list
const recyclerKey = computed(() => `${sortOrder.value}-${sortedWords.value.length}`)

const handleBookmark = (word: WordObject) => {
  store.toggleBookmark(word)
  store.updateReviewInFirestore()
  console.log('Word bookmarked')
}

const isAlertOpen = ref(false)
const setAlertOpen = (state: boolean) => {
  isAlertOpen.value = state
}
const alertButtons = [
  {
    text: 'Cancel'
  },
  {
    text: 'Delete',
    // @ts-ignore
    handler: () => deleteWord(wordToDelete.value)
  }
]

const scroller = ref<HTMLElement | null>(null)

const wordToDelete = ref<WordObject | null>(null)
const handleDeleteAlert = (word: WordObject) => {
  setAlertOpen(true)
  wordToDelete.value = word
}
const deleteWord = async (word: WordObject) => {
  const scrollElement = await content.value.$el.getScrollElement()
  // Get the current scroll position
  const scrollPosition = scrollElement.scrollTop
  console.log(scrollPosition)

  try {
    if (!user.value) throw new Error('User not defined')

    const usersDocRef = doc(db, 'users', user.value.uid)
    await updateDoc(usersDocRef, {
      review: arrayRemove(word)
    })

    // NOTE this delay makes the deletion more obvious to users
    setTimeout(async () => {
      store.deleteWord(word.word)
      await nextTick()
      setTimeout(() => {
        scrollElement.scrollTo({ top: scrollPosition, behavior: 'auto' })
      }, 1)
      // scrollElement.scrollTo({ top: scrollPosition, behavior: 'auto' })
    }, 500)

    emit('wordDeleted', word.word)
    setToastOpen(true)
    wordToDelete.value = null
    console.log('word deleted')
  } catch (err) {
    console.log(`Failed to delete word ${err}`)
  }
}

const isToastOpen = ref(false)
const setToastOpen = (state: boolean) => {
  isToastOpen.value = state
}

const search = ref('')
const sortOrder = ref('createdDesc')
const sortedWords = computed(() => {
  const words = search.value
    ? props.allWords.filter((word) => word.word.toLowerCase().includes(search.value.toLowerCase()))
    : props.allWords
  switch (sortOrder.value) {
    case 'createdAsc':
      return words.sort((a, b) => a.created - b.created)
    case 'wordAsc':
      return words.sort((a, b) => a.word.localeCompare(b.word))
    case 'wordDesc':
      return words.sort((a, b) => b.word.localeCompare(a.word))
    // REVIEW consider sorting these by alphabetical order rather than creation date
    case 'bookmarked':
      return words.filter((word) => word.bookmarked === true)
    case 'sourceCustom':
      return words.filter((word) => word.source === 'custom-list')
    case 'sourceProvided':
      return words.filter((word) => word.source === 'provided-list')

    default:
      // this sorts by createdDesc
      return words.sort((a, b) => b.created - a.created)
  }
})

const isDarkModeEnabled = inject('isDarkModeEnabled')
const getSelectedWordHighlight = (word: string) => {
  if (!props.selectedWord) return ''
  if (word === props.selectedWord.word && !isDarkModeEnabled.value) return 'light-selected'
  if (word === props.selectedWord.word && isDarkModeEnabled.value) return 'dark-selected'
}

const getItemClass = (index: number) => {
  return index === sortedWords.value.length - 1 ? '' : 'item-line'
}

const isVisible = ref(false)
const scrollTrigger = ref<HTMLElement | null>(null)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    isVisible.value = !entry.isIntersecting
  })
})

const content = ref<HTMLElement | null>(null)
const scrollToTop = () => {
  // @ts-ignore
  if (content.value) content.value.$el.scrollToTop(500)
  // const scrollElement = await content.value.$el.getScrollElement()
  // const scrollPosition = scrollElement.scrollTop
  // console.log(scrollPosition)
  // scrollElement.scrollTo({ top: scrollPosition, behavior: 'auto' })
}

onMounted(() => {
  if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)
})

onUnmounted(() => {
  observer.disconnect()
})
</script>

<style lang="scss" scoped>
ion-header {
  display: flex;
  align-items: center;
}

ion-toolbar {
  display: flex;
  ion-buttons,
  ion-button {
    height: 100%;
  }
  // --background: #8ed6ce;
  // --background: #b9e5e1;
}

ion-searchbar {
  display: flex;
  justify-content: center;
  padding: 0 1rem;
}

@media only screen and (min-width: 768px) {
  .mobile-view {
    display: none;
  }
}

ion-content {
  --background: #b9e5e1;
  // --background: #dcf2f0;
  @media (min-width: 639px) {
    --background: white;
  }
}

select {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  padding: 0 10px;
  height: 40px;
  width: 100%;
  border: 1px solid #ccc;
  background-image: url(@/assets/icons/chevron-down-dark.svg);
  background-position: calc(100% - 8px) center;
  background-repeat: no-repeat;
}

body.dark {
  ion-content {
    --background: rgb(26, 26, 26);
  }

  select {
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    background: rgb(46, 46, 46);
    border: 1px solid rgb(65, 65, 65);
    background-image: url(@/assets/icons/chevron-down-light.svg);
    background-position: calc(100% - 8px) center;
    background-repeat: no-repeat;
  }

  .item-line {
    border-bottom: 1px solid rgb(64, 64, 64);
  }
}

ion-item {
  margin-left: 0px !important;
  padding-left: 0px !important;
  --padding-start: 0px;
  --inner-padding-end: 0px;
}

.item-line {
  border-bottom: 1px solid rgb(200, 199, 204);
}

.light-selected {
  --ion-item-background: rgb(236, 236, 236);
  // padding: 0 0.5rem;
  // margin-left: 0.5rem;
}
.dark-selected {
  --ion-item-background: rgb(58, 58, 58);
}
.scroll-trigger {
  height: 800px;
  position: absolute;
  visibility: hidden;

  @media (min-width: 1024px) {
    height: 2400px;
  }
}

// for virtual scroll
// .scroller {
//   height: 100%;
// }
</style>
