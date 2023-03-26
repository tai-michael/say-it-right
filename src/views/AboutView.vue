<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div class="tested-paragraph">
      <p v-html="testedParagraph"></p>
    </div>
    <!-- <button @click="handleMicPress">
      {{ isRecording ? 'Stop microphone' : 'Start microphone' }}
    </button> -->
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

    <div class="transcript-container">
      <label>Recorded words:</label>
      <div>{{ temporaryTranscriptDisplay }}</div>
    </div>

    <div class="tested-evaluation">
      <div v-if="evaluationText === 'isCurrentlyRecording'"></div>
      <div v-else-if="evaluationText === 'noWordsRecorded'">
        Hold the recording button to begin recording.
      </div>
      <div v-else-if="evaluationText === 'fewWordsRecorded'">
        You didn't record enough words. Please try again.<br />
        Remember to hold the button while recording!
      </div>
      <div v-else-if="evaluationText === 'allWordsCorrect'">
        You pronounced each tested word correctly. Very impressive!<br />
        Now let's test your pronunciation of other words that are commonly mispronounced.
      </div>
      <div v-else-if="evaluationText === 'oneWordIncorrect'">
        You pronounced only one word incorrectly. Good job!<br />
        Let's test your pronunciation of this word again to make sure.
      </div>
      <div v-else-if="evaluationText === 'mostWordsCorrect'">
        You did pretty good! But these highlighted words were not pronounced correctly.<br />
        Let's test your pronunciation of these words again to make sure.
      </div>
      <div v-else-if="evaluationText === 'mostWordsIncorrect'">
        These highlighted words were not pronounced correctly.<br />
        But let's test your pronunciation of these words again to make sure.
      </div>
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

    <push-to-talk-button
      v-cloak
      v-show="showComponent"
      placement="bottom"
      appid="20b0ff74-506d-4327-8970-73b671c98193"
    >
    </push-to-talk-button>
    <!-- <intro-popup> </intro-popup> -->
    <!-- <intro-popup>
      <span slot="priming-body">You'll be able to control this web app faster with voice.</span>
    </intro-popup> -->
    <!-- <button @click="handleClearPress" :disabled="!transcript">Clear</button> -->
  </div>
</template>

<script setup>
// import LoadingDots from '../components/LoadingDots.vue'
import { ref, computed } from 'vue'
import { useAdjustTestedWords, useFilterCorrectAndIncorrectWords } from '@/common/composables.js'
import { stateToString } from '@speechly/browser-client'
// NOTE maybe put in App.js instead
import { microphone, client } from '@/speechlyInit.js'
// import '@speechly/browser-ui/core/big-transcript'
// import '@speechly/browser-ui/core/intro-popup'
import MicIcon from '@/assets/images/mic.vue'
import { openai } from '@/openaiInit.js'

let showComponent = ref(false)
let isRecording = ref(false)
let temporaryTranscript = ref('')
let finalTranscript = ref('')
let testComplete = ref(false)
let micStateText = ref('Not actively recording')
// let clientStateText = ref('Connecting...')
let clientConnected = ref(false)
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
//   clientStateText.value = stateToString(state)
// })
client.onStateChange((state) => {
  if (stateToString(state) === 'Connected') clientConnected.value = true
  // setTimeout(() => {
  //   clientFullyInitialized.value = true
  // }, 2000)
})

const testedParagraph = ref(
  'Stephen Hawking was a courageous and successful scientist who inspired many people throughout society. He had vivid ideas and a variety of interests, which he pursued with discipline and careful study. He was known for his wise words, and many people were comforted by his advice. He often said that to succeed in life, one must think carefully and have a solid plan.'
)

const testedWordsList = ref([
  'vivid',
  'successful',
  'inspired',
  'variety',
  'think',
  'said',
  'comforted',
  'he', // replace this word, maybe with world (e.g. 'many people around the world were...')
  'plan',
  'study',
  'courageous',
  'society',
  'discipline'
])

const correctlyPronouncedTestedWords = ref([])
const mispronouncedTestedWords = ref([])

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
  testedWordsList.value = useAdjustTestedWords(testedWordsList.value, testedParagraph.value)

  const { correctWords, incorrectWords } = useFilterCorrectAndIncorrectWords(
    testedWordsList.value,
    finalTranscript.value
  )

  correctlyPronouncedTestedWords.value = correctWords
  mispronouncedTestedWords.value = incorrectWords

  // NOTE highlights mispronounced tested words in red and correctly pronounced words in green; consider not highlighting correct words in the final version
  testedParagraph.value = highlightCorrectAndIncorrectWords(
    testedParagraph.value,
    correctlyPronouncedTestedWords.value,
    mispronouncedTestedWords.value
  )

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `Write a short paragraph no more than 80 words total about a random person or subject. Make sure to write the name of the person in the first sentence. Keep the language simple, but include all of the following words in the paragraph:
        ${testedWordsList.value.join(', ')}

        Use these words exactly as they appear in the list; do not change the word forms. For example, do not change a noun to an adjective, or present tense to past tense. Also, use each word just once in the entire paragraph.`
      }
    ]
  })
  console.log(completion.data.choices[0].message)

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
  else if (correctlyPronouncedTestedWords.value.length === testedWordsList.value.length)
    return 'allWordsCorrect'
  else if (correctlyPronouncedTestedWords.value.length === testedWordsList.value.length - 1)
    return 'oneWordIncorrect'
  else if (correctlyPronouncedTestedWords.value.length > testedWordsList.value.length * 0.5)
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
  testComplete.value ? '' : temporaryTranscript.value.split(' ').slice(-10).join(' ')
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
    align-items: center;
  }
}

label {
  font-weight: 800;
}

.tested-paragraph {
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
  height: 50px;
}

.transcript-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-height: 100vh;
  padding: 3rem 0 0 0;
  margin: 3rem 2rem 0 2rem;
  // NOTE Probably needs to be lower, but test this first
  max-width: 500px;
  z-index: 10;
}

.button-container {
  position: fixed;
  box-sizing: border-box;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 100vh;
  padding: 0 0 3rem 0;

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
