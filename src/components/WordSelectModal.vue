<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button @click="emit('dismissModal')">Cancel</ion-button>
        </ion-buttons>
        <!-- <ion-title>Choose a word</ion-title> -->
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar type="text" v-model="search" placeholder="Search"></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" ref="content">
      <div ref="scrollTrigger" class="scroll-trigger"></div>
      <div class="pl-4 pr-4">
        <!-- <label for="sort">Sort by:</label> -->
        <select id="sort" v-model="sortOrder" :inset="true" class="h-8 w-full rounded-lg">
          <option value="createdDesc">Newest</option>
          <option value="createdAsc">Oldest</option>
          <option value="wordAsc">A to Z</option>
          <option value="wordDesc">Z to A</option>
          <option value="bookmarked">Bookmarked</option>
          <option value="sourceCustom">Source: Custom list words</option>
          <option value="sourceProvided">Source: Provided list words</option>
        </select>
      </div>

      <ion-list id="modal-list" :inset="true" class="mt-2">
        <ion-item
          v-for="(word, index) in sortedWords"
          :key="index"
          button
          detail="false"
          :class="getSelectedWordHighlight(word.word)"
          lines="full"
        >
          <ion-icon
            :icon="`${word.bookmarked ? star : starOutline}`"
            class="text-xl m-0 p-3 pl-4"
            slot="start"
            @click="handleBookmark(word)"
          ></ion-icon>

          <span @click="chooseWord(word)" class="flex items-center w-full h-full">{{
            word.word
          }}</span>

          <ion-icon
            :icon="trashOutline"
            class="text-lg m-0 p-3 pr-4"
            slot="end"
            @click="handleDeleteAlert(word)"
          ></ion-icon>
        </ion-item>

        <!-- <RecycleScroller
          class="scroller"
          :items="sortedWords"
          :item-size="43"
          key-field="word"
          v-slot="{ item }"
        >
          <ion-item :class="getSelectedWordHighlight(item.word)" lines="full">
            <span @click="chooseWord(item)" class="w-full">{{ item.word }}</span>
            <ion-icon
              :icon="starOutline"
              class="text-xl mr-2"
              slot="end"
              @click="testFn"
            ></ion-icon>
            <ion-icon
              :icon="trashOutline"
              class="text-xl"
              slot="end"
              @click="deleteWord(item)"
            ></ion-icon>
          </ion-item>
        </RecycleScroller> -->
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
import { computed, inject, ref, onMounted, onUnmounted } from 'vue'
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

const handleBookmark = (word: WordObject) => {
  store.toggleBookmark(word)
  store.updateReviewInFirestore()
  console.log('Word bookmarked')
}

const wordToDelete = ref<WordObject | null>(null)
const isAlertOpen = ref(false)

const setAlertOpen = (state: boolean) => {
  isAlertOpen.value = state
}
const handleDeleteAlert = (word: WordObject) => {
  setAlertOpen(true)
  wordToDelete.value = word
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

const deleteWord = async (word: WordObject) => {
  try {
    if (!user.value) throw new Error('User not defined')

    const usersDocRef = doc(db, 'users', user.value.uid)
    await updateDoc(usersDocRef, {
      review: arrayRemove(word)
    })

    store.deleteWord(word.word)
    console.log('word deleted')
    emit('wordDeleted', word.word)
    setToastOpen(true)
    wordToDelete.value = null
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
}

onMounted(() => {
  if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)
})

onUnmounted(() => {
  observer.disconnect()
})
</script>

<style lang="scss" scoped>
ion-item {
  margin-left: 0px !important;
  padding-left: 0px !important;
  --padding-start: 0px;
  --inner-padding-end: 0px;
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
