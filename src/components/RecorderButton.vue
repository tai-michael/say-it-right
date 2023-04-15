<template>
  <div class="button-container">
    <button
      v-if="clientConnected && !props.challengeStatus.includes('ENDED')"
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
</template>

<script setup>
import { computed, onDeactivated, ref } from 'vue'

import { client, microphone } from '@/speechlyInit.js'
import MicIcon from '@/assets/images/mic.vue'

const props = defineProps({
  challengeStatus: { type: String, required: true }
})

let finalTranscript = ref('')
let temporaryTranscript = ref('')

const clientConnected = computed(() => client.decoderOptions.connect === true)

const attachMicrophone = async () => {
  if (microphone.mediaStream) return
  await microphone.initialize()
  await client.attach(microphone.mediaStream)
}

// NOTE Resetting the value here is necessary, since I'm currently unable to 'detach' the mic/mediastream/client when I swap between views, meaning finalTranscript in this component carries over
onDeactivated(() => {
  finalTranscript.value = ''
})

const emit = defineEmits(['recordingStarted', 'recordingStopped', 'temporaryTranscriptRendered'])

const startRecording = async () => {
  await attachMicrophone()
  await client.start()
  emit('recordingStarted')
}

const stopRecording = async () => {
  await client.stop()
  emit('recordingStopped', finalTranscript.value)
}

const renderTranscript = (segment) => {
  return segment.words.map((w) => w.value).join(' ')
}

client.onSegmentChange((segment) => {
  temporaryTranscript.value = renderTranscript(segment)
  emit('temporaryTranscriptRendered', temporaryTranscript.value)

  if (segment.isFinal) {
    finalTranscript.value = `${finalTranscript.value} ${temporaryTranscript.value}`.trim()
    //   debugOutText += renderOutput(segment)

    // // REVIEW Sometimes, Speechly keeps recording even after the recording button has been released from hold. Below guard might prevent this bug. (tested, failed once)
    // if (!isRecording.value) client.stop()
  }
})
</script>

<style lang="scss" scoped>
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

    // transform: scale(1);
    /* text-align: left; */
    position: relative;
    // pointer-events: auto;
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
