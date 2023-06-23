<template>
  <div class="button-container">
    <button
      v-if="clientConnected"
      class="recording-btn mobile-view"
      @touchstart="(e) => startRecording(e, true)"
      @touchend="stopRecording"
      ref="recorderButtonMobile"
    >
      <MicIcon />
    </button>

    <button
      v-if="clientConnected"
      class="recording-btn desktop-view"
      @mousedown="(e) => startRecording(e, false)"
    >
      <MicIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, onDeactivated, ref } from 'vue'
import { client, microphone } from '@/speechlyInit.ts'
import MicIcon from '@/assets/icons/mic.vue'

// NOTE prevents right-click from triggering on hold when using Chrome devtools.
// See https://stackoverflow.com/questions/49092441/unwanted-right-click-with-in-browser-devtools
const recorderButtonMobile = ref(null)
const disableContextMenu = (e) => {
  e.preventDefault()
}
onMounted(async () => {
  await attachMicrophone()
  console.log('mic attached')

  if (recorderButtonMobile.value) {
    recorderButtonMobile.value.addEventListener('contextmenu', disableContextMenu, true)
  }
})

onUnmounted(() => {
  if (recorderButtonMobile.value)
    recorderButtonMobile.value.removeEventListener('contextmenu', disableContextMenu, true)
})

const finalTranscript = ref('')
const temporaryTranscript = ref('')

// @ts-ignore
const clientConnected = computed(
  () => client.decoderOptions.connect === true && clientInitialized.value
)

const clientInitialized = ref(false)

const attachMicrophone = async () => {
  console.log(client.initialized)
  if (microphone.mediaStream) return (clientInitialized.value = client.initialized)
  await microphone.initialize()
  // console.log('microphone.initialize() finished')
  // @ts-ignore
  await client.attach(microphone.mediaStream)
  clientInitialized.value = client.initialized
}

// NOTE Resetting the value here is necessary, since I'm currently unable to 'detach' the mic/mediastream/client when I swap between views, meaning finalTranscript and temporaryTranscript in this component carries over to the new view
onDeactivated(() => {
  finalTranscript.value = ''
})

const emit = defineEmits(['recordingStarted', 'recordingStopped', 'temporaryTranscriptRendered'])

const startRecording = async (e, isMobile) => {
  // console.log('mousedown/touchstart triggered')
  // NOTE Need to manually add and remove transform for mobile view, as :active is sticky on mobile even after releasing the button
  if (isMobile) e.target.classList.add('recording-btn-transform')
  // NOTE If mouseup happens outside an element (e.g. when user clicks, holds, then releases outside the button), the mouseup event is not captured. That's why I need to add a global event listener for it on the 'document' or 'window' object.
  document.addEventListener('mouseup', handleStopRecording)
  if (client.isActive()) return

  await client.start()
  // console.log('client.start() finished')
  // console.log(`client's isActive status: ${client.isActive()}`)
  emit('recordingStarted')
}

const stopRecording = async (e) => {
  // console.log('mouseup/touchend triggered')
  e.target.classList.remove('recording-btn-transform')

  if (!client.isActive()) return

  await client.stop()
  // console.log('client stopped')
  // console.log(`client's isActive status: ${client.isActive()}`)
  emit('recordingStopped', finalTranscript.value)
  finalTranscript.value = ''
  document.removeEventListener('mouseup', handleStopRecording)
}

const handleStopRecording = (e) => {
  stopRecording(e)
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
  left: 1;
  right: 0;
  max-height: 100vh;
  // padding-bottom: 1rem;
  margin: -0.75rem;
  margin-right: -1rem;

  display: flex;
  flex-direction: row;
  // justify-content: center;
  z-index: 10000;

  // TODO test if 500px is enough to trigger for tablets
  // @media (min-width: 639px) {
  @media (min-width: 500px) {
    left: 0;
    bottom: 2rem;
    justify-content: center;
  }

  .recording-btn {
    display: flex;
    justify-content: center;
    align-items: center;
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
    transition: transform 0.3s;

    // Triggers for desktops with mouse
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #e65757;
      }
      &:active {
        transform: scale(1.1);
      }
    }
  }

  .recording-btn-transform {
    transform: scale(1.1);
  }

  .mobile-view {
    display: none;
  }

  .desktop-view {
    display: inline-block;
  }

  /* Mobile devices */
  @media screen and (max-width: 767px) {
    .mobile-view {
      display: inline-block;
    }
    .desktop-view {
      display: none;
    }
  }

  /* Desktop devices */
  @media screen and (min-width: 768px) {
    .mobile-view {
      display: none;
    }
    .desktop-view {
      display: inline-block;
    }
  }
}
</style>
