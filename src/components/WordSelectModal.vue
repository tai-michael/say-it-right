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
      <div class="tw-pl-4 tw-pr-4">
        <!-- <label for="sort">Sort by:</label> -->
        <select id="sort" v-model="sortOrder" :inset="true" class="tw-w-full tw-h-8 tw-rounded-lg">
          <option value="createdDesc">Newest</option>
          <option value="createdAsc">Oldest</option>
          <option value="wordAsc">A to Z</option>
          <option value="wordDesc">Z to A</option>
          <option value="sourceCustom">Source: Custom list words</option>
          <option value="sourceProvided">Source: Provided list words</option>
        </select>
      </div>

      <ion-list id="modal-list" :inset="true" class="tw-mt-2">
        <ion-item
          v-for="(word, index) in sortedWords"
          :key="index"
          @click="chooseWord(word)"
          :class="{
            'highlighted-light': word.word === props.selectedWord.word && !isDarkModeEnabled,
            'highlighted-dark': word.word === props.selectedWord.word && isDarkModeEnabled
          }"
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

const isDarkModeEnabled = inject('isDarkModeEnabled')

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
</script>

<style lang="scss" scoped>
.highlighted-light {
  --ion-item-background: rgb(230, 230, 230) !important;
  // padding: 0 0.5rem;
  // margin-left: 0.5rem;
}
.highlighted-dark {
  --ion-item-background: rgb(54, 54, 54) !important;
}
</style>
