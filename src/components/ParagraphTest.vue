<template>
  <div class="about">
    <hr />
    <div class="tested-paragraph">
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

    <div v-else class="tested-evaluation">
      <div v-if="evaluationText === 'isCurrentlyRecording'"></div>
      <div v-else-if="evaluationText === 'noWordsRecorded'" class="tested-evaluation__text">
        <span>Let's start by testing your pronunciation.</span>
        <span>Hold the button and read the paragraph.</span>
      </div>
      <div v-else-if="evaluationText === 'fewWordsRecorded'" class="tested-evaluation__text">
        <span>You didn't record enough words. Please try again.</span>
        <span>Remember to hold the button while recording!</span>
      </div>
      <div v-else-if="evaluationText === 'allWordsCorrect'" class="tested-evaluation__text">
        <span>You pronounced each tested word correctly. Very impressive!</span>
        <span
          >Next, let's test your pronunciation of other words that are commonly mispronounced.</span
        >
      </div>
      <div v-else-if="evaluationText === 'oneWordIncorrect'" class="tested-evaluation__text">
        <span>You pronounced only one word incorrectly. Good job!</span>
        <span>Next, let's practice pronouncing this word.</span>
      </div>
      <div v-else-if="evaluationText === 'mostWordsCorrect'" class="tested-evaluation__text">
        <span
          >You did pretty well! However, these highlighted words were not pronounced
          correctly.</span
        >
        <span>Next, let's practice pronouncing these words.</span>
      </div>
      <div v-else-if="evaluationText === 'mostWordsIncorrect'" class="tested-evaluation__text">
        <span>These highlighted words were not pronounced correctly.</span>
        <span>Next, let's practice pronouncing these words.</span>
      </div>
    </div>

    <button v-if="testComplete" @click="store.paragraphTestCompleted = true">Next</button>
    <!-- <RouterLink to="/about/word-test">Next</RouterLink> -->

    <div class="button-container">
      <button
        v-if="clientConnected && !testComplete"
        class="recording-btn"
        @mousedown="startRecording"
        @touchstart="startRecording"
        @mouseup="stopRecording"
        @touchend="stopRecording"
      >
        <!-- {{ isRecording ? 'Recording' : 'Hold to talk' }} -->
        <MicIcon />
      </button>
    </div>
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
// import LoadingDots from '../components/LoadingDots.vue'
import { onMounted, ref, computed } from 'vue'
import useAdjustTestedWords from '@/composables/useAdjustTestedWords'
import useFilterCorrectAndIncorrectWords from '@/composables/useFilterCorrectAndIncorrectWords'
// import { stateToString } from '@speechly/browser-client'
// NOTE maybe put in App.js instead
import { microphone, client } from '@/speechlyInit.js'
// import '@speechly/browser-ui/core/big-transcript'
// import '@speechly/browser-ui/core/intro-popup'
import MicIcon from '@/assets/images/mic.vue'
import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()

const props = defineProps({
  paragraph: { type: String, required: true },
  wordList: { type: Array, required: true }
})

onMounted(() => {
  testedParagraph.value = props.paragraph
  testedWordList.value = [...props.wordList]
})

// let showComponent = ref(false)
let isRecording = ref(false)
let temporaryTranscript = ref('')
let finalTranscript = ref('')
let testComplete = ref(false)
let micStateText = ref('Not actively recording')
const clientConnected = computed(() => client.decoderOptions.connect === true)
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

const initMic = async () => {
  if (!microphone.mediaStream) {
    await microphone.initialize()
    if (microphone.mediaStream) {
      await client.attach(microphone.mediaStream)
    }
  }
}

const startRecording = async () => {
  // evaluationText.value = ''
  await initMic()
  await client.start()
  isRecording.value = true
}

const stopRecording = async () => {
  await client.stop()
  isRecording.value = false

  if (finalTranscript.value.split(' ').length <= 10) return

  // NOTE chatGPT sometimes modifies tested words that we feed it for creating paragraphs. To prevent bugs, we use this function to change any tested word to its modified version in the paragraph.
  testedWordList.value = useAdjustTestedWords(testedWordList.value, testedParagraph.value)

  const { correctWords, incorrectWords } = useFilterCorrectAndIncorrectWords(
    testedWordList.value,
    finalTranscript.value
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

microphone.onStateChange((state) => {
  micStateText.value = state
})

// const renderSegmentDetails = (intent, entities) => {
//   if (!intent.intent) return (intentText.value = '')
//   const entitiesList = entities.map((e) => `${e.value} (${e.type})`).join(', ')
//   intentText.value = intent.intent
//   entitiesList ? (entitiesListText.value = ` · entities: ${entitiesList}`) : ''
// }

// const renderSegment = (segment) => {
//   timestamp.value = formatDuration(segment.words[segment.words.length - 1].endTimestamp)
//   // transcriptText.value = renderTranscript(segment)
//   // renderSegmentDetails(segment.intent, segment.entities)
// }

// const handleClearPress = () => {
//   transcript.value = ''
// }

const temporaryTranscriptDisplay = computed(() =>
  testComplete.value ? '' : temporaryTranscript.value.split(' ').slice(-8).join(' ')
)

const renderTranscript = (segment) => {
  return segment.words.map((w) => w.value).join(' ')
}

client.onSegmentChange((segment) => {
  // clearBtn.disabled = false;
  temporaryTranscript.value = renderTranscript(segment)
  if (segment.isFinal) {
    // console.log(temporaryTranscriptLength)
    finalTranscript.value = `${finalTranscript.value} ${temporaryTranscript.value}`.trim()
    //   debugOutText += renderOutput(segment)

    // REVIEW Sometimes, Speechly keeps recording even after the recording button has been released from hold. Below guard might prevent this bug. (tested, failed once)
    if (!isRecording.value) client.stop()
  }
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

.tested-paragraph {
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

.tested-evaluation {
  margin-top: 1rem;
  // height: 50px;

  &__text {
    display: flex;
    flex-direction: column;
    span {
      padding-bottom: 0.5rem;
      font-weight: 600;
    }
  }
}

.transcript-container {
  position: fixed;
  // top: 0;
  left: 0;
  right: 0;
  // bottom: 1;
  max-height: 100vh;
  // padding: 3rem 0 0 0;
  margin: 1rem 2rem;
  // NOTE Probably needs to be lower, but test this first
  max-width: 500px;
  // z-index: 10;
}

.button-container {
  position: fixed;
  box-sizing: border-box;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 100vh;
  padding-bottom: 2rem;

  display: flex;
  flex-direction: row;
  justify-content: center;
  z-index: 50;

  .recording-btn {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #fa2222;
    // display: flex;
    // align-items: center;
    // justify-content: center;

    --gradient-stop1: #15e8b5;
    --gradient-stop2: #4fa1f9;
    --fx-gradient-stop1: #15e8b5;
    --fx-gradient-stop2: #4fa1f9;
    --fx-rotation: 9280.04deg;
    --fx-opacity: 0;
    --fx-size: 250%;
    --icon-opacity: 1;
    --icon-size: 60%;
    --icon-color: #000000;
    --frame-stroke-width: 3.45;
    --frame-background: #ffffff;
    transform: scale(1);
    /* text-align: left; */
    position: relative;
    /* pointer-events: auto; */
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none !important;
    // -webkit-user-select: none !important;

    &:active {
      background-color: #fc4343;
      transition: 0.3s;
      width: 85px;
      height: 85px;
      transition: width 0.3s, height 0.3s;
    }
  }
}
</style>
