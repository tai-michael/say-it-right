<template>
  <div class="about">
    <hr />
    <div class="test-paragraph">
      <p v-html="testedParagraph"></p>
    </div>
    <hr />
    <!-- <button @click="handleMicPress">
      {{ isRecording ? 'Stop microphone' : 'Start microphone' }}
    </button> -->

    <div v-if="isRecording && !testComplete" class="transcript-container">
      <label>Live transcript:</label>
      <div>{{ temporaryTranscriptDisplay }}</div>
    </div>

    <div v-else class="test-evaluation">
      <div v-if="evaluationText === 'isCurrentlyRecording'"></div>
      <div v-else-if="evaluationText === 'noWordsRecorded'" class="test-evaluation__text">
        <span>Let's start by testing your pronunciation.</span>
        <span>Hold the button and read the paragraph.</span>
      </div>
      <div v-else-if="evaluationText === 'fewWordsRecorded'" class="test-evaluation__text">
        <span>You didn't record enough words. Please try again.</span>
        <span>Remember to hold the button while recording!</span>
      </div>
      <div v-else-if="evaluationText === 'allWordsCorrect'" class="test-evaluation__text">
        <span>You pronounced each tested word correctly. Very impressive!</span>
        <span>Let's test your pronunciation of other words that are commonly mispronounced.</span>
      </div>
      <div v-else-if="evaluationText === 'oneWordIncorrect'" class="test-evaluation__text">
        <span>You pronounced only one word incorrectly. Good job!</span>
        <span>Next, let's practice pronouncing this word.</span>
      </div>
      <div v-else-if="evaluationText === 'mostWordsCorrect'" class="test-evaluation__text">
        <span
          >You did pretty well! However, these highlighted words were not pronounced
          correctly.</span
        >
        <span>Next, let's practice pronouncing these words.</span>
      </div>
      <div v-else-if="evaluationText === 'mostWordsIncorrect'" class="test-evaluation__text">
        <span>These highlighted words were not pronounced correctly.</span>
        <span>Next, let's practice pronouncing these words.</span>
      </div>
    </div>

    <button class="next-button" v-if="testComplete" @click="store.paragraphTestCompleted = true">
      Next
    </button>
    <!-- <RouterLink to="/about/word-test">Next</RouterLink> -->

    <RecorderButton
      @recording-started="isRecording = true"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :test-complete="testComplete"
    />

    <!-- <div>Tentative transcript: {{ tentativeText }}</div> -->
    <!-- <div>Final transcript: {{ transcriptText }}</div> -->
    <!-- <div>Connection to Speechly API: {{ clientStateText }}</div> -->
    <!-- <div>Mic status: {{ micStateText }}</div> -->
    <!-- <p>Duration: {{ timestamp }}</p> -->
    <!-- <div>{{ debugOutText }}</div> -->
    <!-- <div>{{ intentText }}</div>
    <div>{{ entitiesListText }}</div> -->
    <!-- <big-transcript placement="top"> </big-transcript> -->

    <!-- <push-to-talk-button
      v-cloak
      v-show="showComponent"
      placement="bottom"
      appid="20b0ff74-506d-4327-8970-73b671c98193"
    >
    </push-to-talk-button> -->
    <!-- <intro-popup> </intro-popup> -->
    <!-- <intro-popup>
      <span slot="priming-body">You'll be able to control this web app faster with voice.</span>
    </intro-popup> -->
    <!-- <button @click="handleClearPress" :disabled="!transcript">Clear</button> -->
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

import RecorderButton from './RecorderButton.vue'

// REVIEW maybe put in App.js instead
// import { client, microphone } from '@/speechlyInit.js'
// import MicIcon from '@/assets/images/mic.vue'
// import { stateToString } from '@speechly/browser-client'
// import '@speechly/browser-ui/core/big-transcript'
// import '@speechly/browser-ui/core/intro-popup'

import useAdjustTestedWords from '@/composables/useAdjustTestedWords'
import useFilterCorrectAndIncorrectWords from '@/composables/useFilterCorrectAndIncorrectWords'

import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()

const props = defineProps({
  paragraph: { type: String, required: true },
  wordList: { type: Array, required: true }
  // recorderComponentKey: { type: String, required: true }
})

onMounted(() => {
  testedParagraph.value = props.paragraph
  testedWordList.value = [...props.wordList]
})

// let showComponent = ref(false)

let isRecording = ref(false)
let testComplete = ref(false)
// let temporaryTranscript = ref('')
// let finalTranscript = ref('')
// let micStateText = ref('Not actively recording')
// const clientConnected = computed(() => client.decoderOptions.connect === true)
// let clientStateText = ref('Connecting...')
// let clientFullyInitialized = ref(false)
// let evaluationText = ref('')
// let debugOutText = ref('')
// let tentativeText = ref('')
// let transcriptText = ref('')
// NOTE Speechly's intent and entity detection allows the guessing of words from users when it's unclear. This feature is counterproductive, as our app trains pronunciation.
// let intentText = ref('')
// let entitiesListText = ref('')
// let timestamp = ref('')

// client.onStateChange((state) => {
//   if (stateToString(state) === 'Connected') clientConnected.value = true
//   // setTimeout(() => {
//   //   clientFullyInitialized.value = true
//   // }, 2000)
// })

const testedParagraph = ref('')
const testedWordList = ref([])

const correctlyPronouncedTestedWords = ref([])
// const mispronouncedTestedWords = ref([])

// TODO relocate this to WordTest
let temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript) => {
  temporaryTranscript.value = transcript
}

const temporaryTranscriptDisplay = computed(() =>
  testComplete.value ? '' : temporaryTranscript.value?.split(' ').slice(-8).join(' ')
)

let finalTranscript = ref('')

const handleFinalTranscript = (transcript) => {
  isRecording.value = false
  finalTranscript.value = transcript

  if (transcript.split(' ').length <= 10) return

  // NOTE chatGPT sometimes modifies tested words that we feed it for creating paragraphs. To prevent bugs, we use this function to change any tested word to its modified version in the paragraph.
  testedWordList.value = useAdjustTestedWords(testedWordList.value, testedParagraph.value)

  const { correctWords, incorrectWords } = useFilterCorrectAndIncorrectWords(
    testedWordList.value,
    transcript
  )

  correctlyPronouncedTestedWords.value = correctWords
  store.mispronouncedTestedWords = incorrectWords
  // mispronouncedTestedWords.value = incorrectWords

  // NOTE highlights mispronounced tested words in red and correctly pronounced words in green; consider not highlighting correct words in the final version
  testedParagraph.value = highlightCorrectAndIncorrectWords(
    testedParagraph.value,
    correctlyPronouncedTestedWords.value,
    (store.mispronouncedTestedWords = incorrectWords)
    // mispronouncedTestedWords.value
  )

  testComplete.value = true
}

const highlightCorrectAndIncorrectWords = (paragraph, correctWords, incorrectWords) => {
  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g

  // Splits the paragraph into an array of words and punctuation marks
  const paragraphWords = paragraph.match(wordRegex)

  const lowercaseParagraphWords = paragraphWords.map((word) => word.toLowerCase())

  // NOTE keeps track of words that have already been marked as incorrect and correct, so that only the first instance of the word is highlighted
  const highlightedIncorrectWords = new Set()
  const highlightedCorrectWords = new Set()

  const highlightedWords = lowercaseParagraphWords.map((word, index) => {
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

  let highlightedParagraph = highlightedWords.join(' ')

  return fixPunctuation(highlightedParagraph)
}

const fixPunctuation = (paragraph) => {
  const replacements = [
    { from: ' .', to: '.' },
    { from: ' , ', to: ', ' },
    { from: ' ; ', to: '; ' },
    { from: ' : ', to: ': ' },
    { from: " ' ", to: "' " },
    { from: "' ", to: "'" },
    { from: '" ', to: '"' },
    { from: /"([^"]*)"/g, to: '"$1" ' }
  ]

  for (const { from, to } of replacements) {
    paragraph = paragraph.replaceAll(from, to)
  }
  return paragraph
}

const evaluationText = computed(() => {
  if (isRecording.value) return 'isCurrentlyRecording'
  else if (!finalTranscript.value.length) return 'noWordsRecorded'
  else if (finalTranscript.value.split(' ').length <= 10) return 'fewWordsRecorded'
  else if (correctlyPronouncedTestedWords.value.length === testedWordList.value.length)
    return 'allWordsCorrect'
  else if (correctlyPronouncedTestedWords.value.length === testedWordList.value.length - 1)
    return 'oneWordIncorrect'
  else if (correctlyPronouncedTestedWords.value.length > testedWordList.value.length * 0.5)
    return 'mostWordsCorrect'
  else return 'mostWordsIncorrect'
})
</script>

<style lang="scss" scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    // align-items: center;
  }
}

label {
  font-weight: 800;
}

.test-paragraph {
  margin: 1rem 0;
  // 'deep' selector is necessary, as scoped styles don't apply to content inside v-html
  &:deep(.incorrect),
  &:deep(.correct) {
    color: white;
  }

  &:deep(.incorrect) {
    // The fourth 0 sets the highlight to fully transparent. Using rgba, which allows the setting of transparency, keeps the text fully visible.
    background-color: rgba(255, 0, 0, 0);
    // the forwards tested word keeps the final animation state
    animation: fadeInRed 0.5s ease-in-out forwards;
  }

  &:deep(.correct) {
    background-color: rgba(0, 128, 0, 0);
    animation: fadeInGreen 0.5s ease-in-out forwards;
  }

  @keyframes fadeInRed {
    0% {
      background-color: rgba(255, 0, 0, 0);
    }
    100% {
      background-color: rgba(255, 0, 0, 1);
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

.test-evaluation {
  margin-top: 1rem;
  // height: 50px;

  &__text {
    display: flex;
    flex-direction: column;
    span {
      padding-bottom: 0.5rem;
      font-weight: 600;
      color: #ff7f5f;
    }
  }
}

.transcript-container {
  margin-top: 1rem;
  min-height: 64px;

  // position: fixed;
  // // top: 0;
  // left: 0;
  // right: 0;
  // // bottom: 1;
  // max-height: 100vh;
  // // padding: 3rem 0 0 0;
  // margin: 1rem 2rem;
  // // NOTE Probably needs to be lower, but test this first
  // max-width: 500px;
  // // z-index: 10;
}

.next-button {
  max-width: 50px;
}
</style>
