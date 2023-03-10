<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="handleMicPress">
      {{ micIsActive ? 'Stop microphone' : 'Start microphone' }}
    </button>
    <div>{{ micStateText }}</div>
    <div>{{ clientStateText }}</div>
    <!-- <p>{{ segment }}</p> -->
    <!-- <div>sdf</div> -->
    <div>{{ debugOutText }}</div>
    <div>{{ transcriptText }}</div>
    <p>{{ timestamp }}</p>
    <div>{{ intentText }}</div>
    <div>{{ tentativeText }}</div>
    <div>{{ entitiesListText }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BrowserClient, BrowserMicrophone, stateToString } from '@speechly/browser-client'
import formatDuration from 'format-duration'

// let isVadEnabled = false;

const microphone = new BrowserMicrophone()
let micIsActive = ref(false)
let micStateText = ref('Placeholder')
let clientStateText = ref('Placeholder')
let tentativeText = ref('')
let debugOutText = ref('')
let transcriptText = ref('')
let intentText = ref('')
let entitiesListText = ref('')
let timestamp = ref('')

const client = new BrowserClient({
  appId: '20b0ff74-506d-4327-8970-73b671c98193',
  logSegments: true,
  debug: true
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
    micIsActive.value = false
  } else {
    await initMic()
    await client.start()
    micIsActive.value = true
  }
}

const renderTranscript = (segment) => {
  return segment.words.map((w) => w.value).join(' ')
}

const renderSegmentDetails = (intent, entities) => {
  if (!intent.intent) return (intentText.value = '')
  const entitiesList = entities.map((e) => `${e.value} (${e.type})`).join(', ')
  intentText.value = intent.intent
  entitiesList ? (entitiesListText.value = ` · entities: ${entitiesList}`) : ''
}

const renderSegment = (segment) => {
  timestamp.value = formatDuration(segment.words[segment.words.length - 1].endTimestamp)
  renderTranscript(segment)
  renderSegmentDetails(segment.intent, segment.entities)
  // return `<div class="segment">
  //   <div>${timestamp}</div>
  //   <div class="segment-content">
  //     <div>${renderTranscript(segment)}</div>
  //     ${renderSegmentDetails(segment.intent, segment.entities)}
  //   </div>
  // </div>`
}

// const renderOutput = (segment) => {
//   return `<code>${JSON.stringify(segment, undefined, 2)}</code>`
// }

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
    // tentativeText = ''
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
