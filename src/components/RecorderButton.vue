<template>
  <div class="button-container" :class="{ 'review-active': route.name === 'review' }">
    <!-- Pointerdown detects both mousedown and touchstart;
      it's needed in case it's narrowscreen on PC. 
      Touchend is needed to detect touch release,
      which pointerup cannot detect if click & dragged -->
    <button
      v-if="clientConnected"
      class="recording-btn narrowscreen"
      @pointerdown="(e) => startRecording(e, true)"
      @touchend="stopRecording"
      ref="recorderButtonNarrowscreen"
    >
      <MicIcon />
      <span class="uppercase text-base text-white">Hold to speak</span>
    </button>

    <button
      v-if="clientConnected"
      class="recording-btn widescreen"
      @pointerdown="(e) => startRecording(e, false)"
    >
      <MicIcon />
      <span class="uppercase text-base text-white">Hold to speak</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, onDeactivated, ref } from 'vue'
import { client } from '@/speechlyInit.ts'
import { BrowserMicrophone } from '@speechly/browser-client'
import MicIcon from '@/assets/icons/mic.vue'
import { useRoute } from 'vue-router'
const route = useRoute()

// NOTE prevents right-click from triggering on hold when using Chrome devtools.
// See https://stackoverflow.com/questions/49092441/unwanted-right-click-with-in-browser-devtools
const recorderButtonNarrowscreen = ref(null)
const disableContextMenu = (e) => {
  e.preventDefault()
}

const microphone = ref()
const clientInitialized = ref(false)
// @ts-ignore
const clientConnected = computed(
  () => client.decoderOptions.connect === true && clientInitialized.value
)
let isMounted = false

const attachMicrophone = async () => {
  microphone.value = new BrowserMicrophone()
  if (microphone.value.mediaStream?.active) return (clientInitialized.value = client.initialized)

  await microphone.value.initialize()
  // NOTE stops microphone stream if user switches tab before mic's finished initializing
  if (!isMounted) return stopMicrophoneStream(microphone.value.mediaStream)
  await client.attach(microphone.value.mediaStream)
  clientInitialized.value = client.initialized
}

const stopMicrophoneStream = (mediaStream: MediaStream) => {
  if (!mediaStream) return
  mediaStream.getTracks().forEach((track) => {
    track.stop()
  })
}

onMounted(async () => {
  isMounted = true
  await attachMicrophone()

  if (recorderButtonNarrowscreen.value) {
    recorderButtonNarrowscreen.value.addEventListener('contextmenu', disableContextMenu, true)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  isMounted = false
  stopMicrophoneStream(microphone.value.mediaStream)

  if (recorderButtonNarrowscreen.value)
    recorderButtonNarrowscreen.value.removeEventListener('contextmenu', disableContextMenu, true)

  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
)

// NOTE The connection to Speechly is lost after about 1-3 minutes of mobile being put to sleep. In such cases, remounting the recorder button doesn't reestablish the connection, so need to reload the page
const handleVisibilityChange = async () => {
  // client.decoder.connectPromise changing from Promise to null is the only way to tell whether the Speechly connection has been lost
  if (
    isMobile &&
    document.visibilityState === 'visible' &&
    client.decoder.connectPromise === null
  ) {
    location.reload()
  }
}

// NOTE Resetting the value here is necessary, since I'm currently unable to 'detach' the mic/mediastream/client when I swap between views, meaning finalTranscript and temporaryTranscript in this component carries over to the new view
onDeactivated(() => {
  finalTranscript.value = ''
})

const finalTranscript = ref('')
const temporaryTranscript = ref('')

const emit = defineEmits(['recordingStarted', 'recordingStopped', 'temporaryTranscriptRendered'])

const startRecording = async (e: PointerEvent, isNarrowScreen: boolean) => {
  // console.log('mousedown/touchstart triggered')

  // NOTE It's necessary to manually add and remove transform for mobile view, as :active is sticky on mobile even after releasing the button
  if (isNarrowScreen && e.pointerType === 'touch') {
    const target = e.target as HTMLElement | null
    if (target) {
      const button = target.closest('.recording-btn')
      if (button) {
        button.classList.add('recording-btn-transform')
      }
    }
  }

  // NOTE If mouseup happens outside an element (e.g. when user clicks, holds, then releases outside the button), the mouseup event is not captured. That's why I need to add a global event listener for it on the 'document' or 'window' object.
  if (e.pointerType === 'mouse') document.addEventListener('pointerup', handleStopRecording)
  if (client.isActive()) return

  await client.start()
  // console.log('client.start() finished')
  // console.log(`client's isActive status: ${client.isActive()}`)
  emit('recordingStarted')
}

const stopRecording = async (e) => {
  // console.log('mouseup/touchend triggered')
  if (!client.isActive()) return

  const button = e.target.closest('.recording-btn')
  if (button) {
    button.classList.remove('recording-btn-transform')
  }

  await client.stop()
  // console.log('client stopped')
  // console.log(`client's isActive status: ${client.isActive()}`)
  emit('recordingStopped', finalTranscript.value)
  finalTranscript.value = ''
  if (e.pointerType === 'mouse') document.removeEventListener('pointerup', handleStopRecording)
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
  left: 0;
  right: 0;
  bottom: 14px; // 8px/10px/14px
  display: flex;
  justify-content: center;
  z-index: 10000;
  // max-height: 100vh;

  @media (min-width: 768px) and (max-width: 1119px) {
    margin-left: 110px;
    max-width: 1020px !important;
  }

  @media (min-width: 1120px) and (max-width: 1234px) {
    min-width: 1263px !important;
    // margin-left: 112px;
  }

  .recording-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 0.5rem;
    width: 90%;
    max-width: 330px;
    height: 55px;
    // height: 65px;
    // background-color: #3bb3ac;
    background-color: #39aba4;
    // background-color: #36a19c;
    // background-color: #31928c;
    // background-color: #0a8adf;
    // background-color: #0a8adf;
    // background-color: #fa2222;
    // background-color: #fb6262; // #fa5757
    position: relative;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none !important;
    transition: transform 0.3s;
    border-radius: 8px;
    // border-radius: 16px;
    // border-radius: 35px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
      rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;

    // Triggers for widescreens with mouse
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #3bb3ac;
        // background-color: #0b90e9;
        // background-color: #e65757;
      }
      &:active {
        transform: scale(1.02);
      }
    }

    @media only screen and (min-width: 481px) {
      max-width: 280px;
    }
  }

  // Triggers for touch press
  .recording-btn-transform {
    transform: scale(1.02);
    background-color: #3bb3ac;
  }

  .narrowscreen {
    display: flex;
  }

  .widescreen {
    display: none;
  }

  /* widescreen devices */
  @media screen and (min-width: 768px) {
    .narrowscreen {
      display: none;
    }
    .widescreen {
      display: flex;
    }
  }
}

body.dark {
  .recording-btn {
    background-color: #353535;
    // background-color: #236864;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background-color: #3b3b3b;
        // background-color: #267470;
      }
    }
  }

  .recording-btn-transform {
    background-color: #3b3b3b;
  }

  button {
    span {
      color: rgb(196, 196, 196);
    }
  }
}

.review-active {
  @media only screen and (min-width: 768px) {
    min-width: 1950px;
  }

  @media only screen and (min-width: 768px) and (max-width: 850px) {
    margin-left: 400px;
    min-width: 0px;
  }

  @media only screen and (min-width: 851px) and (max-width: 1462px) {
    // margin-left: 23rem;
    // min-width: 0px;
    // margin-left: 200px;
    margin-left: 448px;
    min-width: 0px !important;
  }

  @media only screen and (min-width: 1463px) {
    max-width: 1950px;
  }
}
</style>
