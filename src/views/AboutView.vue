<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div class="sample-paragraph">
      <p v-if="!highlightedParagraphShown">{{ sampleParagraph }}</p>
      <p v-if="highlightedParagraphShown" v-html="highlightedText"></p>
    </div>
    <!-- <button @click="handleMicPress">
      {{ isRecording ? 'Stop microphone' : 'Start microphone' }}
    </button> -->
    <div class="button-container">
      <button
        v-if="clientConnected"
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
      <label>What you said:</label>
      <div>{{ transcript }}</div>
    </div>
    <!-- <div>Tentative transcript: {{ tentativeText }}</div> -->
    <!-- <div>Final transcript: {{ transcriptText }}</div> -->
    <!-- <div>Connection to Speechly API: {{ clientStateText }}</div> -->
    <!-- <div>Mic status: {{ micStateText }}</div> -->
    <!-- <p>Duration: {{ timestamp }}</p> -->
    <!-- <div>{{ debugOutText }}</div> -->
    <!-- <div>{{ intentText }}</div>
    <div>{{ entitiesListText }}</div> -->
    <big-transcript placement="top"> </big-transcript>

    <push-to-talk-button
      v-cloak
      v-show="showComponent"
      placement="bottom"
      appid="20b0ff74-506d-4327-8970-73b671c98193"
    >
    </push-to-talk-button>
    <intro-popup> </intro-popup>
    <!-- <intro-popup>
      <span slot="priming-body">You'll be able to control this web app faster with voice.</span>
    </intro-popup> -->
    <!-- <button @click="handleClearPress" :disabled="!transcript">Clear</button> -->
  </div>
</template>

<script setup>
// import LoadingDots from '../components/LoadingDots.vue'
import { ref, computed } from 'vue'
import { BrowserClient, BrowserMicrophone, stateToString } from '@speechly/browser-client'
// NOTE maybe put in App.js instead
import '@speechly/browser-ui/core/push-to-talk-button'
import '@speechly/browser-ui/core/big-transcript'
import '@speechly/browser-ui/core/intro-popup'
import MicIcon from '@/assets/images/mic.vue'

const microphone = new BrowserMicrophone()
const client = new BrowserClient({
  appId: '20b0ff74-506d-4327-8970-73b671c98193',
  logSegments: true,
  debug: true
  // NOTE Voice Activity Detection (VAD) reduces the CPU load of the decoder, as it prevents the decoder from processing silent parts of the audio. However, it may also introduce some errors in the resulting transcript. For the purposes of this app, VAD should probably be disabled.
  // vad: { enabled: isVadEnabled },
})

let showComponent = ref(false)
let isRecording = ref(false)
let transcript = ref('')
let micStateText = ref('Not actively recording')
// let clientStateText = ref('Connecting...')
let clientConnected = ref(false)
let clientFullyInitialized = ref(false)
let highlightedParagraphShown = ref(false)
// let debugOutText = ref('')
// let tentativeText = ref('')
// let transcriptText = ref('')
// NOTE Speechly's intent and entity detection allows the guessing of words from users when it's unclear. This feature is counterproductive, as our app trains pronunciation.
// let intentText = ref('')
// let entitiesListText = ref('')
// let timestamp = ref('')

const sampleParagraph = ref(
  'Nelson Mandela was a courageous leader who inspired society with his vivid ideas and successful fight against apartheid in South Africa. He once said, "I think education is the most powerful weapon which you can use to change the world." Mandela\'s plan for a free and democratic South Africa required a variety of strategies, including peaceful protests and civil disobedience. Despite spending 27 years in prison, he remained disciplined and continued to study, eventually becoming the first black president of South Africa. Mandela\'s legacy has comforted millions, reminding us that anything is possible with determination and the power of the human spirit.'
)

const diagnosticWords = ref([
  'vivid',
  'successful',
  'inspired',
  'variety',
  'think',
  'said',
  'comforted',
  'he',
  'plan',
  'study',
  'courageous',
  'society',
  'discipline'
])

// NOTE might need to put the two variables below inside the 'segment.isFinal' callback
const correctlyPronouncedWords = ref([])
const mispronouncedWords = ref([])

// onMounted(() => {
//   // Render the component, but keep it hidden
//   showComponent.value = true
//   showComponent.value = false
//   // Hide the component after 2 seconds, then show it again after an additional delay

//   setTimeout(() => {
//     showComponent.value = true
//   }, 1000)
// })

const initMic = async () => {
  if (!microphone.mediaStream) {
    await microphone.initialize()
    if (microphone.mediaStream) {
      await client.attach(microphone.mediaStream)
    }
  }
}

// const handleMicPress = async () => {
//   if (client.isActive()) {
//     await client.stop()
//     isRecording.value = false
//   } else {
//     await initMic()
//     await client.start()
//     isRecording.value = true
//   }
// }

const startRecording = async () => {
  await initMic()
  await client.start()
  isRecording.value = true
}

const stopRecording = async () => {
  await client.stop()
  isRecording.value = false
}

const renderTranscript = (segment) => {
  return segment.words.map((w) => w.value).join(' ')
}

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

microphone.onStateChange((state) => {
  micStateText.value = state
})

// client.onStateChange((state) => {
//   clientStateText.value = stateToString(state)
// })

client.onStateChange((state) => {
  if (stateToString(state) === 'Connected') clientConnected.value = true
  setTimeout(() => {
    clientFullyInitialized.value = true
  }, 2000)
})

client.onSegmentChange((segment) => {
  // clearBtn.disabled = false;
  transcript.value = renderTranscript(segment)
  if (segment.isFinal) {
    //   debugOutText += renderOutput(segment)
    //   renderSegment(segment)
    // //  NOTE uncomment below line and transcriptText in renderSegment if I want to include both tentative and final transcripts
    //   tentativeText.value = ''

    //   console.log(client)

    const recordedWords = [...new Set(transcript.value.split(' '))]
    correctlyPronouncedWords.value = [
      ...diagnosticWords.value.filter((word) => recordedWords.includes(word))
    ]

    for (const word of diagnosticWords.value) {
      if (!correctlyPronouncedWords.value.includes(word)) {
        mispronouncedWords.value.push(word)
      }
    }

    highlightedParagraphShown.value = true
    console.log(correctlyPronouncedWords.value)
    console.log(mispronouncedWords.value)
  }
})

const highlightedText = computed(() => {
  let highlightedParagraph = sampleParagraph.value
  mispronouncedWords.value.forEach((word) => {
    highlightedParagraph = highlightedParagraph.replace(
      new RegExp(`\\b${word}\\b`, 'g'),
      `<span style="color:white; display: inline-block； padding: .25em 0; background: red">${word}</span>`
    )
  })
  return highlightedParagraph
})

// // NOTE Implement a listener for speech segment updates
// document.getElementsByTagName('push-to-talk-button')[0].addEventListener('speechsegment', (e) => {
//   const speechSegment = e.detail
//   console.log(speechSegment.entities)

//   speechSegment.entities.forEach((entity) => {
//     let select = document.getElementById(entity.type)
//     let options = Array.from(select.getElementsByTagName('option')).map(
//       (option) => option.innerHTML
//     )

//     const found = options.find((option) =>
//       entity.value.toLowerCase().startsWith(option.toLowerCase())
//     )

//     if (found) select.value = found
//   })
// })
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
    display: flex;
    align-items: center;
    justify-content: center;

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
    -webkit-user-select: none !important;

    &:active {
      background-color: #27ae60;
      transition: 0.3s;
      width: 85px;
      height: 85px;
      transition: width 0.3s, height 0.3s;
    }
  }
}
</style>
