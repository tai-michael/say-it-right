<template>
  <ion-page v-if="tabMounted">
    <TheHeader :is-loading="isLoadingRelatedWord">
      <div v-if="!isNarrowScreen">Review</div>
      <template #list>
        <!-- <ion-button :detail="false" id="word-selection-list" class="ml-11 mr-5 max-h-8"> -->
        <!-- <ion-label class="m-0 max-h-8 pl-3 pr-3">Choose a word to review</ion-label> -->
        <div class="flex justify-center">
          <ion-button
            v-if="isNarrowScreen"
            :detail="false"
            @click="handleOpenModal"
            class="max-h-8"
          >
            <ion-label>Click to choose word</ion-label>
          </ion-button>
        </div>
      </template>
    </TheHeader>

    <ion-content>
      <PullRefresher />
      <keep-alive>
        <WordDrill
          v-if="selectedWord"
          :word="selectedWord"
          :key="selectedWord.word"
          @loading-related-word="handleLoadingRelatedWord"
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
          :all-words="allWords"
          :selected-word="selectedWord"
          :forced-rerender-key="forcedRerenderKey"
        />
      </TransitionFadeAndSlide>
    </Teleport>

    <WordSelectModal
      v-if="!isNarrowScreen"
      @select-word="setWord"
      @word-deleted="handleWordDeleted"
      :all-words="allWords"
      :selected-word="selectedWord"
      :forced-rerender-key="forcedRerenderKey"
      class="widescreen-list"
    />

    <!-- This will be for widescreen view -->
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

  <ion-page v-else class="max-h-[100vh]">
    <TheHeader />
    <ion-content>
      <LoadingSpinner />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, defineAsyncComponent, watch } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
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
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
const TransitionFadeAndSlide = defineAsyncComponent(
  () => import('@/components/transitions/TransitionFadeAndSlide.vue')
)
const WordSelectModal = defineAsyncComponent(() => import('@/components/WordSelectModal.vue'))
const WordDrill = defineAsyncComponent(() => import('@/components/WordDrill.vue'))
// import { useArrayFind } from '@vueuse/core'

const store = useReviewStore()
const { allWords } = storeToRefs(store)
watch(
  () => allWords.value.length,
  () => rerenderModal()
)

const selectedWord: Ref<WordObject | null> = ref(null)
const setWord = (word: WordObject) => {
  localStorage.setItem('selectedWord', word.word)
  selectedWord.value = word
}

const isLoadingRelatedWord = ref(false)
const handleLoadingRelatedWord = (loadingRelatedWord: boolean) => {
  isLoadingRelatedWord.value = loadingRelatedWord
}
const handleRelatedWordClicked = (relatedWord: string) => {
  const matchedWord = allWords.value.find((word) => word.word === relatedWord)
  if (matchedWord) selectedWord.value = matchedWord
}
const forcedRerenderKey = ref(0)
const rerenderModal = () => {
  // NOTE alters the modal's key, forcing it to rerender
  forcedRerenderKey.value++
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
  isNarrowScreen.value = window.innerWidth < 768
}

const tabMounted = ref(false)
onMounted(() => {
  // console.log('Review mounted')
  setTimeout(() => {
    tabMounted.value = true

    setTimeout(() => {
      isInitiated.value = true
    }, 1500)
  }, 500)

  const word = localStorage.getItem('selectedWord')
  if (word) {
    // selectedWord.value = useArrayFind(allWords.value, w => w.word === word)
    selectedWord.value = allWords.value.find((w) => w.word === word) ?? null
  }
})

const reviewEntered = ref()
provide('reviewEntered', reviewEntered)
onIonViewWillEnter(() => {
  console.log('Review entered')
  reviewEntered.value = true
  window.addEventListener('resize', handleResize)
  handleResize()
})

onIonViewWillLeave(() => {
  // console.log('Review left')
  reviewEntered.value = false
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
ion-content {
  --background: #d4efed;
}

.widescreen-list {
  width: 344px;
  margin-top: 3.5rem;
  margin-left: 7rem;
  @media only screen and (min-width: 481px) and (max-width: 850px) {
    width: 288px;
  }
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

  width: 90%;
  margin-left: 0.25rem;

  @media only screen and (min-width: 481px) and (max-width: 767px) {
    width: 80%;
    margin-left: 3rem;
    margin-right: 1rem;
  }
}

.instructions {
  color: rgb(80, 80, 80);

  @media only screen and (min-width: 768px) {
    margin-left: 12rem;
    justify-content: start;
    padding-top: 9rem;
  }
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

  .widescreen-list {
    border: 1px solid rgb(50, 50, 50);
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
