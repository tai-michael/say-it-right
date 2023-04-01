<template>
  <main>
    <div>Word Test</div>
    <div>{{ store.mispronouncedTestedWords[0] }}</div>
    <button @click="play">Speaker icon</button>

    <div v-if="isRecording && !testComplete" class="transcript-container">
      <label>Live transcript:</label>
      <div>{{ temporaryTranscriptDisplay }}</div>
    </div>

    <RecorderButton
      @recording-started="isRecording = true"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :test-complete="testComplete"
    />

    <button @click="store.wordTestCompleted = true">Next</button>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

import RecorderButton from './RecorderButton.vue'

import useConvertTextToSpeech from '@/composables/useConvertTextToSpeech.js'
import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()

const play = () => {
  useConvertTextToSpeech('Espresso.', 'male')
}

let isRecording = ref(false)
let testComplete = ref(false)

let temporaryTranscript = ref('')
const handleTempTranscriptRender = (transcript) => {
  temporaryTranscript.value = transcript
}

let finalTranscript = ref('')
const handleFinalTranscript = (transcript) => {
  finalTranscript.value = transcript
}

const temporaryTranscriptDisplay = computed(() =>
  testComplete.value ? '' : temporaryTranscript.value?.split(' ').slice(-8).join(' ')
)
</script>

<style lang="scss" scoped>
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
</style>
