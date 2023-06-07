<template>
  <ion-page>
    <TheHeader>
      <div class="desktop-view">Review</div>
      <template #list>
        <!-- <ion-button :detail="false" id="word-selection-list" class="ml-11 mr-5 max-h-8"> -->
        <!-- <ion-label class="m-0 max-h-8 pl-3 pr-3">Choose a word to review</ion-label> -->
        <ion-button
          :detail="false"
          id="word-selection-list"
          class="ml-12 mr-4 flex max-h-8 mobile-view"
        >
          <ion-label class="m-0 max-h-8">Choose a word to review</ion-label>
        </ion-button>
      </template>
    </TheHeader>

    <ion-content>
      <keep-alive>
        <WordDrill
          :word="selectedWord"
          v-if="selectedWord"
          :key="selectedWord.word"
          @related-word-clicked="handleRelatedWordClicked"
        />
      </keep-alive>
    </ion-content>

    <ion-modal trigger="word-selection-list" ref="modal" class="mobile-view">
      <WordSelectModal
        @dismiss-modal="modal.$el.dismiss()"
        @select-word="setWord"
        @word-deleted="handleWordDeleted"
        :selected-word="selectedWord"
        :all-words="allWords"
      />
    </ion-modal>

    <WordSelectModal
      @dismiss-modal="modal.$el.dismiss()"
      @select-word="setWord"
      @word-deleted="handleWordDeleted"
      :selected-word="selectedWord"
      :all-words="allWords"
      class="desktop-view__select"
    />
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
import WordSelectModal from '@/components/WordSelectModal.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import {
  IonHeader,
  IonToolbar,
  IonPage,
  IonContent,
  IonModal,
  IonItem,
  IonButton,
  IonLabel
} from '@ionic/vue'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import WordDrill from '@/components/WordDrill.vue'
import type { WordObject } from '@/stores/modules/types/Review'
// import type { WordObject } from '@/stores/modules/types/Review'
import { useReviewStore } from '@/stores/index.ts'
// import { useArrayFind } from '@vueuse/core'

const store = useReviewStore()
const { allWords } = storeToRefs(store)

const selectedWord: Ref<WordObject | null> = ref(null)
const modal = ref(null)

const handleRelatedWordClicked = (relatedWord: string) => {
  const matchedWord = allWords.value.find((word) => word.word === relatedWord)
  if (matchedWord) selectedWord.value = matchedWord
}

const setWord = (word: WordObject) => {
  localStorage.setItem('selectedWord', word.word)
  selectedWord.value = word
}

const handleWordDeleted = (wordName: string) => {
  if (wordName !== selectedWord.value?.word) return

  localStorage.setItem('selectedWord', '')
  selectedWord.value = null
}

onMounted(() => {
  const word = localStorage.getItem('selectedWord')
  if (word) {
    // selectedWord.value = useArrayFind(allWords.value, w => w.word === word)
    selectedWord.value = allWords.value.find((w) => w.word === word) ?? null
  }
})
</script>

<style lang="scss" scoped>
@media only screen and (min-width: 768px) {
  .desktop-view {
    display: block;

    &__select {
      width: 300px;
      margin-top: 0.75rem;
    }
  }
  .mobile-view {
    display: none;
  }
}

@media only screen and (max-width: 768px) {
  .desktop-view {
    display: none;

    &__select {
      display: none;
    }
  }
}

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

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(197, 197, 197);
}
</style>
