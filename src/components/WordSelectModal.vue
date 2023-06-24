<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-searchbar type="text" v-model="search" placeholder="Search"></ion-searchbar>
        <ion-buttons slot="end" class="mobile-view">
          <ion-button @click="handleCancel">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" ref="content" id="test">
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
          :key="sortOrder"
          :items="sortedWords"
          :item-size="itemHeight"
          :buffer="520"
          key-field="word"
          v-slot="{ item }"
          class="pt-2 pb-2"
        >
          <ion-item button detail="false" :class="getSelectedWordHighlight(item.word)">
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
              @click="handleDeleteAlert(item, $event)"
            ></ion-icon>
          </ion-item>
        </RecycleScroller>
      </ion-list>
    </ion-content>

    <ion-alert
      :is-open="isAlertOpen"
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
import { computed, ref, inject, onMounted, nextTick, watch, watchEffect } from 'vue'
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
const chooseWord = async (word: WordObject) => {
  emit('selectWord', word)
  emit('dismissModal')
}

const handleCancel = () => {
  emit('dismissModal')
}

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
    handler: () => deleteWord(wordToDelete.value, deleteEvent.value)
  }
]

const wordToDelete = ref<WordObject | null>(null)
const deleteEvent = ref(null)
const handleDeleteAlert = (word: WordObject, event) => {
  setAlertOpen(true)
  wordToDelete.value = word
  deleteEvent.value = event
}
const deleteWord = async (word: WordObject, event) => {
  try {
    if (!user.value) throw new Error('User not defined')

    const usersDocRef = doc(db, 'users', user.value.uid)
    await updateDoc(usersDocRef, {
      review: arrayRemove(word)
    })

    // NOTE this delay makes the deletion more obvious to users
    setTimeout(async () => {
      store.deleteWord(word.word)
      setToastOpen(true)
      if (event) {
        // NOTE though hacky, this is the only solution I can think of to prevent rerendering the entire list after deleting a word (which is undesirable behavior, as we want to maintain the scroll position)
        await shiftElementsUp(event)
        event = null
      }
    }, 500)

    emit('wordDeleted', word.word)
    wordToDelete.value = null
    console.log('word deleted')
  } catch (err) {
    console.log(`Failed to delete word ${err}`)
  }
}

const itemHeight = 49
const shiftElementsUp = async (event) => {
  const removedElement = event.target.parentElement.parentElement
  const siblingElement = removedElement.nextElementSibling
  const parentElement = removedElement.parentElement

  removedElement.remove()
  await nextTick()

  if (siblingElement) {
    const currentSiblingTransform = siblingElement.style.transform || 'translateY(0px)'
    const newSiblingTransform = `translateY(${
      parseInt(currentSiblingTransform.replace('translateY(', '').replace('px)', '')) - itemHeight
    }px)`
    siblingElement.style.transform = newSiblingTransform
  }

  if (parentElement) {
    const currentParentMinHeight = parentElement.style.minHeight || '0px'
    const newParentMinHeight = `calc(${currentParentMinHeight} - ${itemHeight}px)`
    parentElement.style.minHeight = newParentMinHeight
  }

  event = null
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

const isVisible = ref(false)
const scrollTrigger = ref<HTMLElement | null>(null)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    // NOTE to set height at which FAB triggers, refer to '.scroll-trigger'
    isVisible.value = !entry.isIntersecting
  })
})

const content = ref<HTMLElement | null>(null)
const scrollToTop = async () => {
  // @ts-ignore
  if (content.value) content.value.$el.scrollToTop(500)
}

onMounted(async () => {
  if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)

  // NOTE code for triggering rerender for the list upon ANY update of its items
  // watchEffect(() => {
  //   return watch(
  //     sortedWords,
  //     () => {
  //       console.log('watcher triggered')
  //       isUpdating.value = true

  //       setTimeout(() => {
  //         isUpdating.value = false
  //       }, 10)
  //     },
  //     { deep: true }
  //   )
  // })
})

const isDarkModeEnabled = inject('isDarkModeEnabled')
const getSelectedWordHighlight = (word: string) => {
  if (!props.selectedWord) return ''
  if (word === props.selectedWord.word && !isDarkModeEnabled.value) return 'light-selected'
  if (word === props.selectedWord.word && isDarkModeEnabled.value) return 'dark-selected'
}

// const getItemClass = (index: number) => {
//   return index === sortedWords.value.length - 1 ? '' : 'item-line'
// }

// const isUpdating = ref()
// const onUpdate = (startIndex, endIndex, visibleStartIndex, visibleEndIndex) => {
//   console.log('Update event:', startIndex, endIndex, visibleStartIndex, visibleEndIndex)
//   console.log('updated length:')
// }

// NOTE this key is needed for the list to change reactively whenever the order of the list is changed or when a word is deleted from the list. Currently not using it, as it rerenders the entire list and resets scroll position to top, which is undesirable when deleting a word.
// const recyclerKey = computed(() => `${sortOrder.value}-${sortedWords.value.length}`)
</script>

<style lang="scss" scoped>
@media only screen and (min-width: 768px) {
  .mobile-view {
    display: none;
  }
}

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

select {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  padding: 0 10px;
  height: 40px;
  width: 100%;
  border: 1px solid #ccc;
  background: white;
  background-image: url(@/assets/icons/chevron-down-dark.svg);
  background-position: calc(100% - 8px) center;
  background-repeat: no-repeat;
}

ion-content {
  --background: #b9e5e1;
  // --background: #dcf2f0;
  @media (min-width: 639px) {
    --background: white;
  }
}

ion-item {
  margin-left: 0px !important;
  padding-left: 0px !important;
  --padding-start: 0px;
  --inner-padding-end: 0px;
}

// .item-line {
//   border-bottom: 1px solid rgb(200, 199, 204);
// }

ion-alert {
  z-index: 99999 !important;
}

ion-toast {
  z-index: 99999 !important;
}

body.dark {
  ion-toolbar {
    --background: rgb(24, 24, 24);
  }

  ion-content {
    --background: rgb(32, 32, 32);
  }

  ion-searchbar {
    --background: rgb(40, 40, 40);
  }

  select {
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    border: 1px solid rgb(50, 50, 50);
    background: rgb(40, 40, 40);
    background-image: url(@/assets/icons/chevron-down-light.svg);
    background-position: calc(100% - 8px) center;
    background-repeat: no-repeat;
  }

  // .item-line {
  //   border-bottom: 1px solid rgb(64, 64, 64);
  // }
}

.light-selected {
  --ion-item-background: rgb(236, 236, 236);
  // padding: 0 0.5rem;
  // margin-left: 0.5rem;
}
.dark-selected {
  --ion-item-background: rgb(42, 42, 42);
}
.scroll-trigger {
  height: 800px;
  position: absolute;
  visibility: hidden;

  @media (min-width: 1024px) {
    height: 2400px;
  }
}
</style>