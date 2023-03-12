<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="handleMicPress">
      {{ isRecording ? 'Stop microphone' : 'Start microphone' }}
    </button>
    <div>{{ micStateText }}</div>
    <div>{{ clientStateText }}</div>
    <!-- <p>{{ segment }}</p> -->
    <!-- <div>sdf</div> -->
    <div>{{ debugOutText }}</div>
    <p>{{ timestamp }}</p>
    <div>{{ tentativeText }}</div>
    <div>{{ transcriptText }}</div>
    <!-- <div>{{ intentText }}</div>
    <div>{{ entitiesListText }}</div> -->
    <button @click="handleClearPress" :disabled="!transcriptText && !transcriptText">Clear</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BrowserClient, BrowserMicrophone, stateToString } from '@speechly/browser-client'
import formatDuration from 'format-duration'

// let isVadEnabled = false;

const microphone = new BrowserMicrophone()
let isRecording = ref(false)
let micStateText = ref('Placeholder')
let clientStateText = ref('Placeholder')
let tentativeText = ref('')
let debugOutText = ref('')
let transcriptText = ref('')
// NOTE Speechly's intent and entity detection allows the guessing of words from users when it's unclear. This feature is unnecessary, as our app trains pronunciation.
// let intentText = ref('')
// let entitiesListText = ref('')
let timestamp = ref('')

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

const renderSegment = (segment) => {
  timestamp.value = formatDuration(segment.words[segment.words.length - 1].endTimestamp)
  transcriptText.value = renderTranscript(segment)
  // renderSegmentDetails(segment.intent, segment.entities)
}

const handleClearPress = () => {
  transcriptText.value = ''
}

microphone.onStateChange((state) => {
  micStateText.value = state
})

client.onStateChange((state) => {
  clientStateText.value = stateToString(state)
})

client.onSegmentChange((segment) => {
  // clearBtn.disabled = false;
  tentativeText.value = renderTranscript(segment)
  if (segment.isFinal) {
    // debugOutText += renderOutput(segment)
    renderSegment(segment)
    // NOTE remove below line and transcriptText above if I only want tentativeText to show
    tentativeText.value = ''
    console.log(client)
  }
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
</style>
