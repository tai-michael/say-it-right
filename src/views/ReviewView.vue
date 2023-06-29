<template>
  <ion-page v-if="tabMounted">
    <TheHeader>
      <div v-if="!isNarrowScreen">Review</div>
      <template #list>
        <!-- <ion-button :detail="false" id="word-selection-list" class="ml-11 mr-5 max-h-8"> -->
        <!-- <ion-label class="m-0 max-h-8 pl-3 pr-3">Choose a word to review</ion-label> -->
        <ion-button
          v-if="isNarrowScreen"
          :detail="false"
          @click="handleOpenModal"
          class="ml-14 mr-4 flex max-h-8"
        >
          <ion-label class="m-0 max-h-8">Click to choose word</ion-label>
        </ion-button>
      </template>
    </TheHeader>

    <ion-content>
      <PullRefresher />
      <keep-alive>
        <WordDrill
          v-if="selectedWord"
          :word="selectedWord"
          :key="selectedWord.word"
          @related-word-clicked="handleRelatedWordClicked"
        />
        <div
          v-else
          class="instructions flex flex-col h-full w-full justify-center align-middle items-center gap-y-3 p-2 font-semibold"
        >
          <span class="max-w-xs text-center">Review words you've mispronounced.</span>
          <span class="max-w-xs text-center">Choose a word and begin practicing!</span>
        </div>
      </keep-alive>
    </ion-content>

    <!-- NOTE opting not to use ion-modal, as it destroys the modal whenever it's dismissed, meaning the scroll position is reset to top -->
    <Teleport to="#modals">
      <TransitionFadeAndSlide>
        <WordSelectModal
          v-if="isNarrowScreen && isInitiated"
          v-show="isOpen"
          @dismiss-modal="isOpen = false"
          @select-word="setWord"
          @word-deleted="handleWordDeleted"
          :selected-word="selectedWord"
          :all-words="allWords"
        />
      </TransitionFadeAndSlide>
    </Teleport>

    <WordSelectModal
      v-if="!isNarrowScreen"
      @select-word="setWord"
      @word-deleted="handleWordDeleted"
      :selected-word="selectedWord"
      :all-words="allWords"
      class="desktop-list"
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
  <ion-page v-else>
    <TheHeader />
    <LoadingSpinner />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide, defineAsyncComponent } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
const TransitionFadeAndSlide = defineAsyncComponent(
  () => import('@/components/transitions/TransitionFadeAndSlide.vue')
)
const WordSelectModal = defineAsyncComponent(() => import('@/components/WordSelectModal.vue'))
// const WordDrill = defineAsyncComponent(() => import('@/components/WordDrill.vue'))
import {
  IonPage,
  IonContent,
  IonButton,
  IonLabel,
  onIonViewWillEnter,
  onIonViewWillLeave
} from '@ionic/vue'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { WordObject } from '@/stores/modules/types/Review'
import { useReviewStore } from '@/stores/index.ts'
// import { useArrayFind } from '@vueuse/core'

const store = useReviewStore()
const { allWords } = storeToRefs(store)
const selectedWord: Ref<WordObject | null> = ref(null)

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

// NOTE Combining v-if and v-show for the modal, because v-if prevents modal from rendering on initial load of the tab, shaving about 500 ms off from the tab's rendering time. Meanwhile, v-show maintains the scroll position of the modal and is more performant for re-toggling.
const isInitiated = ref(false)
const isOpen = ref(false)
const handleOpenModal = () => {
  isInitiated.value = true
  isOpen.value = true
}
// NOTE media queries only hide but don't remove elements in the DOM. Removing is necessary to prevent having duplicate modals that cause recursive rendering
const isNarrowScreen = ref()
const handleResize = () => {
  isNarrowScreen.value = window.innerWidth <= 768
}

const tabMounted = ref(false)
onMounted(() => {
  // console.log('Review mounted')
  setTimeout(() => {
    tabMounted.value = true
  }, 500)

  const word = localStorage.getItem('selectedWord')
  if (word) {
    // selectedWord.value = useArrayFind(allWords.value, w => w.word === word)
    selectedWord.value = allWords.value.find((w) => w.word === word) ?? null
  }

  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const reviewEntered = ref()
provide('reviewEntered', reviewEntered)
onIonViewWillEnter(() => {
  reviewEntered.value = true
  // console.log('Review entered')
})
onIonViewWillLeave(() => {
  reviewEntered.value = false
  // console.log('Review left')
})
</script>

<style lang="scss" scoped>
.desktop-list {
  width: 300px;
  // margin-top: 2.75rem; // ios setting, since ios headers are shorter
  padding-top: 3.5rem;
}

.review {
  display: flex;
  flex-direction: column;
}

ion-button {
  // --background: #b9e5e1;
  --background: #f0fffd;
  // --background: #8ed6ce;
  --background-activated: #dfeceb;
  --background-focused: #dfeceb;

  &:hover {
    --background: #dfeceb;
  }
  // --color: #287671;
  --color: rgb(80, 80, 80);
  --box-shadow: 0 2px 6px 0 rgb(0, 0, 0, 0.35);
}

.instructions {
  color: rgb(80, 80, 80);
}

body.dark {
  ion-button {
    --background: rgb(226, 226, 226);

    --background-activated: rgb(255, 255, 255);
    --background-focused: rgb(255, 255, 255);

    &:hover {
      --background: rgb(255, 255, 255);
    }

    --color: rgb(32, 32, 32);
  }

  ion-content {
    --background: rgb(32, 32, 32);
  }

  .instructions {
    color: rgb(196, 196, 196);
  }
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
