<template>
  <ion-page>
    <TheHeader>
      <template #list>
        <ion-item
          :button="true"
          :detail="false"
          id="select-words"
          class="tw-max-h-8 tw-p-0 tw-m-0 tw-flex !tw-justify-center !tw-items-center tw-text-center"
        >
          <ion-label class="tw-max-h-8 tw-p-0 tw-m-0">Choose a word to review</ion-label>
        </ion-item>
      </template>
    </TheHeader>

    <ion-content>
      <!-- <div class="word-drill"> -->
      <keep-alive>
        <WordDrill
          :word="selectedWord"
          v-if="selectedWord"
          :key="selectedWord.word"
          @related-word-clicked="handleRelatedWordClicked"
        />
      </keep-alive>
      <!-- </div> -->
    </ion-content>

    <ion-modal trigger="select-words" ref="modal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="end">
            <ion-button @click="modal.$el.dismiss()">Cancel</ion-button>
          </ion-buttons>
          <ion-title>Choose a word</ion-title>
          <!-- <ion-buttons slot="end">
            <ion-button @click="confirmChanges()">Done</ion-button>
          </ion-buttons> -->
        </ion-toolbar>
        <ion-toolbar>
          <ion-searchbar type="text" v-model="search" placeholder="Search"></ion-searchbar>
        </ion-toolbar>
      </ion-header>

      <ion-content color="light" class="ion-padding">
        <!-- <main> -->

        <div class="tw-pl-4 tw-pr-4">
          <!-- <label for="sort">Sort by:</label> -->
          <select
            id="sort"
            v-model="sortOrder"
            :inset="true"
            class="tw-w-full tw-h-8 tw-rounded-lg"
          >
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
            @click="selectWord(word)"
            :class="{ highlighted: word === selectedWord }"
          >
            <span>{{ word.word }}</span>
          </ion-item>
        </ion-list>
        <!-- <hr v-if="Object.keys(allWords).length < 10" /> -->
        <!-- </main> -->
      </ion-content>
    </ion-modal>

    <!-- This will be for desktop view -->
    <!-- <ion-content class="ion-padding">
      <div class="review">
        <main>
          <div class="list-container">
             <label for="sort">Sort by:</label>
            <select id="sort" v-model="sortOrder" class="sort-container">
              <option value="createdDesc">Most recent</option>
              <option value="createdAsc">Least recent</option>
              <option value="wordAsc">A to Z</option>
              <option value="wordDesc">Z to A</option>
              <option value="sourceCustom">Custom list words</option>
              <option value="sourceProvided">Provided list words</option>
            </select>

            <ul class="list">
              <li
                v-for="(word, index) in sortedWords"
                :key="index"
                @click="selectWord(word)"
                class="list__row"
                :class="{ highlighted: word === selectedWord }"
              >
                <span>{{ word.word }}</span>
              </li>
            </ul>
          </div>
          <hr v-if="Object.keys(allWords).length < 10" />
          <keep-alive>
            <WordDrill
              :word="selectedWord"
              v-if="selectedWord"
              :key="selectedWord.word"
              @related-word-clicked="handleRelatedWordClicked"
            />
          </keep-alive>
        </main>
      </div>
    </ion-content> -->
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import {
  IonHeader,
  IonToolbar,
  IonPage,
  IonSearchbar,
  IonContent,
  IonModal,
  IonItem,
  IonTitle,
  IonLabel,
  IonButtons,
  IonButton
} from '@ionic/vue'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import WordDrill from '@/components/WordDrill.vue'
import type { WordObject } from '@/stores/modules/types/Review'
// import type { WordObject } from '@/stores/modules/types/Review'
import { useReviewStore } from '@/stores/index.ts'

const store = useReviewStore()
const { allWords } = storeToRefs(store)

const selectedWord: Ref<WordObject | null> = ref(null)
const modal = ref(null)

const selectWord = (word: WordObject) => {
  selectedWord.value = word
  localStorage.setItem('selectedWord', word.word)
  if (modal.value) modal.value.$el.dismiss()
}

const handleRelatedWordClicked = (relatedWord: string) => {
  const matchedWord = allWords.value.find((word) => word.word === relatedWord)
  if (matchedWord) selectedWord.value = matchedWord
}

const search = ref('')
const sortOrder = ref('createdDesc')
const sortedWords = computed(() => {
  const words = search.value
    ? allWords.value.filter((word) => word.word.toLowerCase().includes(search.value.toLowerCase()))
    : allWords.value
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

onMounted(() => {
  const word = localStorage.getItem('selectedWord')
  if (word) {
    selectedWord.value = allWords.value.find((w) => w.word === word) ?? null
  }
})
</script>

<style lang="scss" scoped>
.review {
  display: flex;
  flex-direction: column;
}

input {
  height: 35px;
  max-width: 470px;
  margin-bottom: 1rem;
  padding: 0.5rem;
  // border-radius: 40px;
}

.list-container {
  display: flex;
  flex-direction: column;
  row-gap: 0.5rem;
}

main {
  display: flex;
  flex-direction: column;
}

h4 {
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}
.list {
  padding-left: 0;
  padding-right: 0.5rem;
  line-height: 2.1;
  li {
    list-style: none;
  }
  // height: 280px;
  overflow-y: auto;
  // min-width: 140px;

  &__row {
    cursor: pointer;
    span {
      padding: 5px;
    }
  }
}
.highlighted {
  background-color: rgb(112, 247, 130);
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(197, 197, 197);
}
</style>
