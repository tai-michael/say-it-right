<template>
  <div class="button-container">
    <button
      v-if="clientConnected && !props.challengeStatus.includes('RECORDING_ENDED')"
      class="recording-btn"
      @mousedown="startRecording"
      @touchstart="startRecording"
      @touchend="stopRecording"
    >
      <!-- {{ isRecording ? 'Recording' : 'Hold to talk' }} -->
      <MicIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onDeactivated, ref } from 'vue'

import { client, microphone } from '@/speechlyInit.ts'
import MicIcon from '@/assets/images/mic.vue'

const props = defineProps({
  challengeStatus: { type: String, required: true }
})

const finalTranscript = ref('')
const temporaryTranscript = ref('')

// @ts-ignore
const clientConnected = computed(() => client.decoderOptions.connect === true)

const attachMicrophone = async () => {
  if (microphone.mediaStream) return
  await microphone.initialize()
  // console.log('microphone.initialize() finished')
  // @ts-ignore
  await client.attach(microphone.mediaStream)
  // console.log('client.attach() finished')
}

// NOTE Resetting the value here is necessary, since I'm currently unable to 'detach' the mic/mediastream/client when I swap between views, meaning finalTranscript and temporaryTranscript in this component carries over to the new view
onDeactivated(() => {
  finalTranscript.value = ''
})

const emit = defineEmits(['recordingStarted', 'recordingStopped', 'temporaryTranscriptRendered'])

const startRecording = async () => {
  // console.log('mousedown/touchstart triggered')
  await attachMicrophone()
  await client.start()
  // console.log('client.start() finished')
  // console.log(`client's isActive status: ${client.isActive()}`)
  emit('recordingStarted')
  // NOTE If mouseup happens outside an element (e.g. when user clicks, holds, then releases outside the button), the mouseup event is not captured. That's why I need to add a global event listener for it on the 'window' object.
  window.addEventListener('mouseup', stopRecording)
}

const stopRecording = async () => {
  // console.log('mouseup/touchend triggered')
  await client.stop()
  // console.log('client is stopped (supposedly)')
  // console.log(`client's isActive status: ${client.isActive()}`)
  emit('recordingStopped', finalTranscript.value)
  finalTranscript.value = ''
  window.removeEventListener('mouseup', stopRecording)
}

interface Segment {
  words: {
    value: string
  }[]
}

const renderTranscript = (segment: unknown) => {
  const s = segment as Segment
  return s.words.map((w) => w.value).join(' ')
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
      background-color: #e96c6c;
      transition: 0.3s;
      width: 85px;
      height: 85px;
      transition: width 0.3s, height 0.3s;
    }
  }
}
</style>
