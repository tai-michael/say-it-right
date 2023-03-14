<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="handleMicPress">
      {{ isRecording ? 'Stop microphone' : 'Start microphone' }}
    </button>
    <label>What you said:</label>
    <div>{{ transcript }}</div>
    <!-- <div>Tentative transcript: {{ tentativeText }}</div> -->
    <!-- <div>Final transcript: {{ transcriptText }}</div> -->
    <!-- <div>Connection to Speechly API: {{ clientStateText }}</div> -->
    <!-- <div>Mic status: {{ micStateText }}</div> -->
    <!-- <p>Duration: {{ timestamp }}</p> -->
    <!-- <div>{{ debugOutText }}</div> -->
    <!-- <div>{{ intentText }}</div>
    <div>{{ entitiesListText }}</div> -->
    <button @click="handleClearPress" :disabled="!transcript">Clear</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BrowserClient, BrowserMicrophone } from '@speechly/browser-client'
// import { BrowserClient, BrowserMicrophone, stateToString } from '@speechly/browser-client'
// import formatDuration from 'format-duration'

// let isVadEnabled = false;

const microphone = new BrowserMicrophone()

let isRecording = ref(false)
let transcript = ref('')
// let micStateText = ref('Not actively recording')
// let clientStateText = ref('Connecting...')
// let debugOutText = ref('')
// let tentativeText = ref('')
// let transcriptText = ref('')
// NOTE Speechly's intent and entity detection allows the guessing of words from users when it's unclear. This feature is counterproductive, as our app trains pronunciation.
// let intentText = ref('')
// let entitiesListText = ref('')
// let timestamp = ref('')

const client = new BrowserClient({
  appId: '20b0ff74-506d-4327-8970-73b671c98193',
  logSegments: true,
  debug: true
  // NOTE Voice Activity Detection (VAD) reduces the CPU load of the decoder, as it prevents the decoder from processing silent parts of the audio. However, it may also introduce some errors in the resulting transcript. For the purposes of this app, VAD should probably be disabled.
  // vad: { enabled: isVadEnabled },
})

const initMic = async () => {
  if (!microphone.mediaStream) {
    await microphone.initialize()
    if (microphone.mediaStream) {
      await client.attach(microphone.mediaStream)
    }
  }
}

const handleMicPress = async () => {
  if (client.isActive()) {
    await client.stop()
    isRecording.value = false
  } else {
    await initMic()
    await client.start()
    isRecording.value = true
  }
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

const handleClearPress = () => {
  transcript.value = ''
}

// microphone.onStateChange((state) => {
//   micStateText.value = state
// })

// client.onStateChange((state) => {
//   clientStateText.value = stateToString(state)
// })

client.onSegmentChange((segment) => {
  // clearBtn.disabled = false;
  transcript.value = renderTranscript(segment)
  // if (segment.isFinal) {
  //   debugOutText += renderOutput(segment)
  //   renderSegment(segment)
  // //  NOTE uncomment below line and transcriptText in renderSegment if I want to include both tentative and final transcripts
  //   tentativeText.value = ''

  //   console.log(client)
  // }
})
</script>

<style>
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
</style>
