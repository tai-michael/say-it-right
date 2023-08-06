<template>
  <ion-page>
    <div class="h-full outer-container">
      <div class="flex flex-col h-full justify-between challenge-container">
        <main class="p-4 flex flex-col w-full h-full items-center justify-center">
          <div class="instructions">
            <TransitionFade>
              <span v-if="props.list.status === 'LIST_NOT_STARTED'"
                >Hold the button and speak this paragraph</span
              >
              <span v-else-if="props.list.status === 'PARAGRAPH_RECORDING_ENDED'"
                >Recording complete</span
              >
            </TransitionFade>
          </div>

          <!-- :class="[testedParagraph.length > 350 ? '!leading-6' : '']" -->
          <ion-card class="ml-0.5 mr-0.5 mb-3 pl-5 pr-5 max-w-xs">
            <div class="tested-paragraph">
              <p v-html="testedParagraph"></p>
            </div>
          </ion-card>
        </main>

        <div class="message-container w-full h-full flex justify-center items-start pt-5">
          <div v-if="isRecording" class="transcript">
            <div class="flex-col">
              <div class="mt-8 mb-4">Recording...</div>
              <div class="flex justify-center">
                <VuMeter ref="vumeter"></VuMeter>
              </div>
            </div>
            <!-- <VuMeter ref="vumeter" :color="highlightcolor"></VuMeter> -->
            <!-- <div class="sound-wave">
              <div
                v-for="(bar, index) in bars"
                :key="index"
                class="bar"
                :style="{ animationDuration: bar.duration + 's' }"
              ></div>
            </div> -->
            <!-- <label>Spoken Words:</label>
        <div>{{ temporaryTranscriptDisplay }}</div> -->
          </div>

          <div v-else class="message">
            <div>
              <div v-if="recordingStatus === 'NOTHING_RECORDED'"></div>
              <div v-else-if="recordingStatus === 'FEW_WORDS_RECORDED'" class="message__text">
                <span>You didn't record enough words.</span>
                <span>Try again, and remember to hold the recording button.</span>

                <!-- <span>Excellent! You pronounced each tested word correctly.</span>
                <span>Next, create or try another list.</span> -->

                <!-- <span>Good job! You mispronounced only one word.</span>
                <span>Let's practice it.</span> -->

                <!-- <span>You did pretty well! However, these words were mispronounced.</span>
                <span>Let's practice them.</span> -->

                <!-- <span>These words were mispronounced.</span>
                <span>Let's practice them.</span> -->
              </div>
              <div v-else-if="recordingStatus === 'ALL_WORDS_CORRECT'" class="message__text">
                <span>Excellent! You pronounced each tested word correctly.</span>
                <span>Next, create or try another list.</span>
              </div>
              <div v-else-if="recordingStatus === 'ONE_WORD_CORRECT'" class="message__text">
                <span>Good job! You mispronounced only one word.</span>
                <span>Let's practice it.</span>
              </div>
              <div v-else-if="recordingStatus === 'MOST_WORDS_CORRECT'" class="message__text">
                <span>You did pretty well! However, these words were mispronounced.</span>
                <span>Let's practice them.</span>
              </div>
              <div
                v-else-if="recordingStatus === 'MOST_WORDS_INCORRECT'"
                class="message__text flex gap-y-2"
              >
                <span>These words were mispronounced.</span>
                <span>Let's practice them.</span>
              </div>
            </div>

            <ion-button
              v-if="
                props.list.status === 'PARAGRAPH_RECORDING_ENDED' &&
                recordingStatus !== 'ALL_WORDS_CORRECT'
              "
              @click="store.setListStatus('TESTING_WORD_ONLY')"
            >
              Next
            </ion-button>
          </div>
        </div>
        <!-- <RouterLink to="/provided-lists/word-test">Next</RouterLink> -->
      </div>

      <RecorderButton
        v-if="props.list.status === 'LIST_NOT_STARTED' && listEntered"
        @recording-started="isRecording = true"
        @recording-stopped="handleFinalTranscript"
        @temporary-transcript-rendered="handleTempTranscriptRender"
      />
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, inject, watch } from 'vue'
import TransitionFade from '@/components/transitions/TransitionFade.vue'
import { IonPage, IonCard } from '@ionic/vue'
import type { PropType } from 'vue'
import type { List, CustomWord, ProvidedWord, Words } from '@/stores/modules/types/List'
import type { WordObject } from '@/stores/modules/types/Review'
import RecorderButton from './RecorderButton.vue'
import VuMeter from '@/components/VuMeter.vue'
import { IonButton } from '@ionic/vue'
import useTestedWordsAdjuster from '@/composables/useTestedWordsAdjuster'
import useCorrectAndIncorrectWordsFilter from '@/composables/useCorrectAndIncorrectWordsFilter'
import useSentencesCreationAndStorage from '@/composables/useSentencesCreationAndStorage'
import useCheckIfWordsExistInReview from '@/composables/useCheckIfWordsExistInReview'
import useWordObjCreator from '@/composables/useWordObjCreator'
import { useRoute } from 'vue-router'
import type { WordSource } from '@/stores/modules/types/Review'
import { useCustomListsStore, useProvidedListsStore, useReviewStore } from '@/stores/index.ts'

const route = useRoute()
const store = route.name === 'provided-list' ? useProvidedListsStore() : useCustomListsStore()
const reviewStore = useReviewStore()

const props = defineProps({
  list: { type: Object as PropType<List>, required: true }
  // paragraph: { type: String, required: true },
  // words: { type: Array, required: true }
  // recorderComponentKey: { type: String, required: true }
})

const vumeter = ref(null)
// const bars = Array.from({ length: 50 }, () => ({ duration: Math.random() * (0.7 - 0.2) + 0.2 }))

const listEntered = inject('listEntered')

const isRecording = ref(false)
const testedParagraph = ref('')
const testedWordsObj =
  route.name === 'provided-list' ? ref<Words<ProvidedWord>>({}) : ref<Words<CustomWord>>({})
const testedWords = ref<string[]>([])

const correctlyPronouncedTestedWords = ref<string[]>([])
const mispronouncedTestedWords = ref<string[]>([])

onMounted(() => {
  testedParagraph.value = props.list.paragraph
  testedWords.value = [...Object.keys(props.list.words)]
  testedWordsObj.value = { ...props.list.words }

  // NOTE restore the words if recording has ended & page is reloaded
  if (props.list.status === 'PARAGRAPH_RECORDING_ENDED') {
    correctlyPronouncedTestedWords.value = Object.keys(testedWordsObj.value).filter((word) => {
      return (
        testedWordsObj.value[word].attempts === 1 &&
        testedWordsObj.value[word].attemptsSuccessful === 1
      )
    })

    mispronouncedTestedWords.value = Object.keys(testedWordsObj.value).filter((word) => {
      return (
        testedWordsObj.value[word].attempts === 1 &&
        testedWordsObj.value[word].attemptsSuccessful === 0
      )
    })
  }
})

// TODO disable temporaryTranscript and related code in production
const temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript: string) => {
  // NOTE this guard is necessary b/c the recorder cannot be deactivated between views. Also, there's a known bug where custom and provided lists with matching numbers (e.g. custom list 1 & provided list 1) will have matching ParagraphChallenge temporary transcripts. We can fix this by adding a routeName prop or something to ParagraphChallenge in Custom/ProvidedList.vue, but since we're removing temporary transcript here in production, we don't care about this bug.
  if (store.activeList?.listNumber !== props.list.listNumber) return
  temporaryTranscript.value = transcript

  // Animated audio waveform
  if (vumeter.value) {
    vumeter.value.updateVU(Math.random() * 0.5 + 0.5, Math.random() * 75 + 75)
  }
}

// const temporaryTranscriptDisplay = computed(() =>
//   temporaryTranscript.value?.split(' ').slice(-8).join(' ')
// )

const finalTranscript = ref('')

const handleFinalTranscript = async (transcript: string) => {
  isRecording.value = false

  // NOTE this guard is necessary b/c the recorder cannot be deactivated between views
  if (store.activeList?.listNumber !== props.list.listNumber) return

  finalTranscript.value = `${finalTranscript.value} ${transcript}`.trim()

  if (finalTranscript.value.split(' ').length <= 10) return

  console.log(`para challenge: ${transcript}`)
  // NOTE chatGPT sometimes modifies tested words that we feed it for creating paragraphs. To prevent bugs, we use this function to change any tested word to its modified version in the paragraph.
  testedWords.value = useTestedWordsAdjuster(
    testedWordsObj.value,
    testedParagraph.value,
    route.name
  )

  const { correctWords, incorrectWords } = useCorrectAndIncorrectWordsFilter(
    testedWords.value,
    finalTranscript.value,
    route.name
  )
  correctlyPronouncedTestedWords.value = correctWords
  mispronouncedTestedWords.value = incorrectWords

  // NOTE highlights mispronounced tested words in red and correctly pronounced words in green; consider not highlighting correct words in the final version.
  testedParagraph.value = highlightCorrectAndIncorrectWords(
    testedParagraph.value,
    correctlyPronouncedTestedWords.value,
    mispronouncedTestedWords.value
  )

  store.setParagraph(testedParagraph.value)
  store.setListStatus('PARAGRAPH_RECORDING_ENDED')

  // NOTE provided lists all have sentences already,
  // so no need to generate new sentences for those
  if (route.name === 'provided-list') {
    // NOTE only add words that aren't already in Review to Review
    const { nonMatchingWords } = useCheckIfWordsExistInReview(
      mispronouncedTestedWords.value,
      route.name
    )
    addWordsToReview(nonMatchingWords, props.list.words)
    store.updateListsInFirestore()
    reviewStore.updateReviewInFirestore()
    // TODO possibly force rerender or reload ReviewView or WordSelectModal here
  } else {
    const sortedMispronouncedWords = mispronouncedTestedWords.value.sort()
    console.log(sortedMispronouncedWords)
    // NOTE splitting up the sentence generation is necessary, as it can be quite slow
    if (sortedMispronouncedWords.length > 3) {
      const firstCoupleWords = sortedMispronouncedWords.slice(0, 2)
      const remainingWords = sortedMispronouncedWords.slice(2)
      // console.log(firstCoupleWords)
      // console.log(remainingWords)
      // NOTE awaiting the first is necessary, as openAI doesn't allow concurrent queries
      await useSentencesCreationAndStorage(
        firstCoupleWords,
        route.name as WordSource,
        props.list.listNumber
      )
      useSentencesCreationAndStorage(
        remainingWords,
        route.name as WordSource,
        props.list.listNumber
      )
    } else
      useSentencesCreationAndStorage(
        sortedMispronouncedWords,
        route.name as WordSource,
        props.list.listNumber
      )

    console.log('finished executing entire handleFinalTranscript function')
  }
}

const addWordsToReview = (
  mispronouncedWords: string[],
  listWords: Words<ProvidedWord> | Words<CustomWord>
) => {
  // TODO Either here or in a new function,
  // only add words that aren't already in Review.
  // Test with providedLists
  const wordObjectsToAdd: WordObject[] = []

  for (const mispronouncedWord of mispronouncedWords) {
    if (listWords.hasOwnProperty(mispronouncedWord)) {
      const wordObject = useWordObjCreator(
        mispronouncedWord,
        listWords[mispronouncedWord].sentences,
        route.name as WordSource
      )

      wordObjectsToAdd.push(wordObject)
    }
  }

  reviewStore.addWords(wordObjectsToAdd)
}

const highlightCorrectAndIncorrectWords = (
  paragraph: string,
  correctWords: string[],
  incorrectWords: string[]
) => {
  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g

  // Splits the paragraph into an array of words and punctuation marks
  const paragraphWords = paragraph.match(wordRegex)

  // @ts-ignore
  const lowercaseParagraphWords = paragraphWords.map((word) => word.toLowerCase())

  // NOTE keeps track of words that have already been marked as incorrect and correct, so that only the first instance of the word is highlighted
  const highlightedIncorrectWords = new Set()
  const highlightedCorrectWords = new Set()

  const highlightedWords = lowercaseParagraphWords.map((word, index) => {
    // @ts-ignore
    const originalWord = paragraphWords[index]
    if (incorrectWords.includes(word) && !highlightedIncorrectWords.has(word)) {
      highlightedIncorrectWords.add(word)
      return `<span class="incorrect">${originalWord}</span>`
    } else if (correctWords.includes(word) && !highlightedCorrectWords.has(word)) {
      highlightedCorrectWords.add(word)
      return `<span class="correct">${originalWord}</span>`
    } else {
      return originalWord
    }
  })

  const highlightedParagraph = highlightedWords.join(' ')

  return fixPunctuation(highlightedParagraph)
}

const fixPunctuation = (paragraph: string) => {
  const replacements = [
    { from: ' .', to: '.' },
    { from: ' , ', to: ', ' },
    { from: ' ; ', to: '; ' },
    { from: ' : ', to: ': ' },
    { from: ' !', to: '!' },
    { from: " ' ", to: "' " },
    { from: "' ", to: "'" },
    { from: '" ', to: '"' },
    { from: /"([^"]*)"/g, to: '"$1" ' }
  ]

  for (const { from, to } of replacements) {
    // @ts-ignore
    paragraph = paragraph.replaceAll(from, to)
  }
  return paragraph
}

const recordingStatus = computed(() => {
  if (isRecording.value) return 'IS_CURRENTLY_RECORDING'
  // NOTE list status is needed b/c finalTranscript is not stored in backend;
  // allows for correct message upon reloading page
  else if (!finalTranscript.value.length && props.list.status === 'LIST_NOT_STARTED')
    return 'NOTHING_RECORDED'
  else if (
    finalTranscript.value.split(' ').length <= 10 &&
    props.list.status === 'LIST_NOT_STARTED'
  )
    return 'FEW_WORDS_RECORDED'
  else if (correctlyPronouncedTestedWords.value.length === testedWords.value.length)
    return 'ALL_WORDS_CORRECT'
  else if (correctlyPronouncedTestedWords.value.length === testedWords.value.length - 1)
    return 'ONE_WORD_CORRECT'
  else if (correctlyPronouncedTestedWords.value.length > testedWords.value.length * 0.5)
    return 'MOST_WORDS_CORRECT'
  else return 'MOST_WORDS_INCORRECT'
})
</script>

<style lang="scss" scoped>
// @media (min-width: 1024px) {
//   main {
//     // min-height: 100vh;
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     // align-items: center;
//   }
// }

ion-page {
  --height: 100%;
}

.outer-container {
  // background-color: #5cc0b9;
  // background-color: #dcf2f0;
  background-color: #d4efed;
}

.challenge-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 1008px;

  /* min margin for left tab */
  @media (min-width: 768px) and (max-width: 1234px) {
    margin-left: 112px;
  }
}

main {
  background-color: #b9e5e1;
}

.instructions {
  height: 19px;
  @media only screen and (min-width: 768px) {
    margin-bottom: 1rem;
  }
}

.instructions,
.message__text {
  font-weight: 600;
  color: rgb(80, 80, 80);
}

ion-card {
  --background: #eef9f8;
}

.tested-paragraph {
  font-size: 1rem;
  color: rgb(19, 19, 19);
  line-height: 1.5rem;
  // line-height: 26px;
  // font-family: Arial;
  // font-family: Verdana;
  // margin: 0.5rem 0;
  p {
    margin: 0.5rem 0.25;
    // text-align: justify;
  }

  @media screen and (min-width: 481px) {
    line-height: 2rem;
  }

  // 'deep' selector is necessary, as scoped styles don't apply to content inside v-html
  &:deep(.incorrect),
  &:deep(.correct) {
    color: white;
  }

  &:deep(.incorrect) {
    // The fourth 0 sets the highlight to fully transparent. Using rgba, which allows the setting of transparency, keeps the text fully visible.
    background-color: rgba(200, 0, 0, 0);
    // the forwards tested word keeps the final animation state
    animation: fadeInRed 0.5s ease-in-out forwards;
  }

  &:deep(.correct) {
    background-color: rgba(0, 128, 0, 0);
    animation: fadeInGreen 0.5s ease-in-out forwards;
  }

  @keyframes fadeInRed {
    0% {
      background-color: rgba(200, 0, 0, 0);
    }
    100% {
      background-color: rgba(200, 0, 0, 1);
    }
  }

  @keyframes fadeInGreen {
    0% {
      background-color: rgba(0, 128, 0, 0);
    }
    100% {
      background-color: rgba(0, 128, 0, 1);
    }
  }
}

// hr {
//   border: none;
//   height: 0.5px;
//   background-color: var(--vt-c-text-dark-2); // gray
// }

// label {
//   font-weight: 800;
// }

.message-container {
  background-color: #8ed6ce;
  max-height: 15rem;
  // align-content: space-around !important;
  // align-content: space-between !important;

  @media screen and (min-width: 481px) {
    align-items: flex-start;
    padding-top: 2.5rem;
    max-height: 20rem;
  }
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 340px;
  padding: 1rem 2rem;
  // row-gap: 0.75rem;
  // min-height: 100px;
  // height: 50px;

  &__text {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    margin-left: 0.1rem;

    span {
      font-weight: 600;
    }
  }
}

.transcript {
  padding-left: 30px;
  padding-right: 30px;
  // display: flex;
  // justify-content: center;

  //   .sound-wave {
  //     margin-top: 1.5rem;
  //     height: 50px;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //   }

  //   .bar {
  //     animation-name: wave-lg;
  //     animation-iteration-count: infinite;
  //     animation-timing-function: ease-in-out;
  //     animation-direction: alternate;
  //     background: #f32968; // Change the color for the bars
  //     margin: 0 1.5px;
  //     height: 10px;
  //     width: 1px; // Change the number for the bar width

  //     &:nth-child(-n + 7),
  //     &:nth-last-child(-n + 7) {
  //       animation-name: wave-md;
  //     }

  //     &:nth-child(-n + 3),
  //     &:nth-last-child(-n + 3) {
  //       animation-name: wave-sm;
  //     }
  //   }
  // }

  // @keyframes wave-sm {
  //   0% {
  //     opacity: 0.35;
  //     height: 10px;
  //   }
  //   100% {
  //     opacity: 1;
  //     height: 25px;
  //   }
  // }

  // @keyframes wave-md {
  //   0% {
  //     opacity: 0.35;
  //     height: 15px;
  //   }
  //   100% {
  //     opacity: 1;
  //     height: 50px;
  //   }
  // }

  // @keyframes wave-lg {
  //   0% {
  //     opacity: 0.35;
  //     height: 15px;
  //   }
  //   100% {
  //     opacity: 1;
  //     height: 70px;
  //   }
}

ion-button {
  // --background: #287671;
  // --background-hover: #31928c;
  --background: #31928c;
  --background-hover: #36a19c;
  --background-activated: #36a19c;

  // max-width: 50px;
  display: flex;
  margin: 1rem 0;
  max-height: 44px;
  text-transform: uppercase;
  color: rgb(231, 253, 243);
  margin-top: 2.25rem;

  @media screen and (min-width: 481px) {
  }
}

body.dark {
  .outer-container {
    // background: rgb(29, 29, 29);
    background: rgb(32, 32, 32);
  }

  main {
    background-color: rgb(34, 34, 34);
  }

  .message-container {
    background-color: rgb(30, 30, 30);
  }

  ion-card {
    --background: rgb(48, 48, 48);
  }

  .instructions,
  .tested-paragraph,
  .message__text {
    color: rgb(196, 196, 196);
  }

  ion-button {
    --background: #414141;
    --background-hover: #4e4e4e;
    --background-activated: #4e4e4e;
    color: rgb(196, 196, 196);
  }
}
</style>
