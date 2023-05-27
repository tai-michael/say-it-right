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

    <ion-content class="ion-padding">
      <div class="pl-4 pr-4">
        <!-- <label for="sort">Sort by:</label> -->
        <select id="sort" v-model="sortOrder" :inset="true" class="h-8 w-full rounded-lg">
          <option value="createdDesc">Newest</option>
          <option value="createdAsc">Oldest</option>
          <option value="wordAsc">A to Z</option>
          <option value="wordDesc">Z to A</option>
          <option value="sourceCustom">Source: Custom list words</option>
          <option value="sourceProvided">Source: Provided list words</option>
        </select>
      </div>

      <ion-list id="modal-list" :inset="true" class="mt-2">
        <ion-item
          v-for="(word, index) in sortedWords"
          :key="index"
          @click="chooseWord(word)"
          :class="getHighlightedClass(word.word)"
        >
          <span>{{ word.word }}</span>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { PropType } from 'vue'
import type { WordObject } from '@/stores/modules/types/Review'
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
  IonButton
} from '@ionic/vue'
const props = defineProps({
  allWords: { type: Array as PropType<WordObject[]>, required: true },
  selectedWord: { type: Object as PropType<WordObject> }
})

const emit = defineEmits(['selectWord', 'dismissModal'])
const chooseWord = (word: WordObject) => {
  emit('selectWord', word)
  emit('dismissModal')
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
const getHighlightedClass = (word: string) => {
  if (word === props.selectedWord.word && !isDarkModeEnabled.value) return 'highlighted-light'
  if (word === props.selectedWord.word && isDarkModeEnabled.value) return 'highlighted-dark'
}
</script>

<style lang="scss" scoped>
.highlighted-light {
  --ion-item-background: rgb(236, 236, 236);
  // padding: 0 0.5rem;
  // margin-left: 0.5rem;
}
.highlighted-dark {
  --ion-item-background: rgb(51, 50, 50);
}
</style>
