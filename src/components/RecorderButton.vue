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
    </button>

    <button
      v-if="clientConnected"
      class="recording-btn widescreen"
      @pointerdown="(e) => startRecording(e, false)"
    >
      <MicIcon />
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

const microphone = ref()

// @ts-ignore
const clientConnected = computed(
  () => client.decoderOptions.connect === true && clientInitialized.value
)
const clientInitialized = ref(false)
const attachMicrophone = async () => {
  microphone.value = new BrowserMicrophone()
  // if (!microphone.value) microphone.value = new BrowserMicrophone()
  // console.log(microphone.value)
  if (microphone.value.mediaStream?.active) return (clientInitialized.value = client.initialized)
  await microphone.value.initialize()
  // console.log('microphone.value.initialize() finished')
  // @ts-ignore
  await client.attach(microphone.value.mediaStream)
  clientInitialized.value = client.initialized
  // console.log(client)
  // console.log(client.initialized)
}

// NOTE prevents right-click from triggering on hold when using Chrome devtools.
// See https://stackoverflow.com/questions/49092441/unwanted-right-click-with-in-browser-devtools
const recorderButtonNarrowscreen = ref(null)
const disableContextMenu = (e) => {
  e.preventDefault()
}

onMounted(async () => {
  await attachMicrophone()
  // console.log('mic attached')

  if (recorderButtonNarrowscreen.value) {
    recorderButtonNarrowscreen.value.addEventListener('contextmenu', disableContextMenu, true)
  }
})
onUnmounted(() => {
  // console.log('mic unmounted')
  stopMicrophoneStream(microphone.value.mediaStream)

  if (recorderButtonNarrowscreen.value)
    recorderButtonNarrowscreen.value.removeEventListener('contextmenu', disableContextMenu, true)
})

function stopMicrophoneStream(mediaStream) {
  if (!mediaStream) return
  mediaStream.getTracks().forEach((track) => {
    track.stop()
  })
  // console.log(microphone)
}

// NOTE Resetting the value here is necessary, since I'm currently unable to 'detach' the mic/mediastream/client when I swap between views, meaning finalTranscript and temporaryTranscript in this component carries over to the new view
onDeactivated(() => {
  finalTranscript.value = ''
})

const finalTranscript = ref('')
const temporaryTranscript = ref('')

const emit = defineEmits(['recordingStarted', 'recordingStopped', 'temporaryTranscriptRendered'])

const startRecording = async (e, isNarrowScreen) => {
  // console.log('mousedown/touchstart triggered')

  // NOTE Need to manually add and remove transform for mobile view, as :active is sticky on mobile even after releasing the button
  if (isNarrowScreen && e.pointerType === 'touch') {
    const button = e.target.closest('.recording-btn')
    if (button) {
      button.classList.add('recording-btn-transform')
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

  @media only screen and (min-width: 481px) {
    left: 0;
    bottom: 2rem;
    justify-content: center;
  }

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

    // Triggers for widescreens with mouse
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

  .narrowscreen {
    display: inline-block;
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
      display: inline-block;
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
