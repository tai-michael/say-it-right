<template>
  <div class="button-container" :class="{ 'review-active': route.name === 'review' }">
    <button
      v-if="speech.isSupported"
      class="recording-btn narrowscreen"
      @pointerdown="(e) => startRecording(e, true)"
      @touchend="stopRecording"
      ref="recorderButtonNarrowscreen"
    >
      <MicIcon />
      <span class="uppercase text-base text-white">{{ $t('recorder_button') }}</span>
    </button>

    <button
      v-if="speech.isSupported"
      class="recording-btn widescreen"
      @pointerdown="(e) => startRecording(e, false)"
      @keydown="(e) => startRecording(e, false)"
      @keyup="stopRecording"
    >
      <MicIcon />
      <span class="uppercase text-base text-white">{{ $t('recorder_button') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useSpeechRecognition } from '@vueuse/core'
import { ToWords } from 'to-words'
// import { client } from '@/speechlyInit.ts'
// import { BrowserMicrophone } from '@speechly/browser-client'
import MicIcon from '@/assets/icons/mic.vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const speech = useSpeechRecognition({
  lang: 'en-US',
  interimResults: true,
  continuous: true
})

function convertNumbersToWordsInSpeech(speechResult) {
  const toWords = new ToWords()
  const words = speechResult.toLowerCase().split(' ')
  const convertedWords = words.map((word) => {
    // Convert numbers to words
    const number = parseInt(word)
    if (!isNaN(number)) {
      return toWords.convert(number)
    }

    // Convert standalone 'i' to 'I'
    if (word === 'i') {
      return 'I'
    }

    return word
  })
  return convertedWords.join(' ')
}

// if (speech.isSupported.value) {
watch(speech.result, () => {
  speech.result.value = convertNumbersToWordsInSpeech(speech.result.value)

  temporaryTranscript.value = speech.result.value
  emit('temporaryTranscriptRendered', temporaryTranscript.value)

  if (speech.isFinal) {
    finalTranscript.value = `${finalTranscript.value} ${temporaryTranscript.value}`.trim()
  }
})
// }


const recognitionActive = ref(false)

const startRecording = async (e, isNarrowScreen: boolean) => {
  if (recognitionActive.value) return
  console.warn('Voice recognition started.')
  recognitionActive.value = true

  handleMobileViewTransform(e, isNarrowScreen)

  speech.result.value = ''
  speech.start()
  emit('recordingStarted')
}

const stopRecording = async (e) => {
  if (recognitionActive.value) {
    handleMobileViewTransformEnd(e)
    speech.stop()
    emit('recordingStopped', finalTranscript.value)
    finalTranscript.value = ''
    recognitionActive.value = false
  }
}

const handleStopRecording = (e) => {
  stopRecording(e)
}

function handleMobileViewTransform(e, isNarrowScreen) {
  // Check if the event is for a narrow screen and is a touch event
  if (isNarrowScreen && e.pointerType === 'touch') {
    const target = e.target as HTMLElement | null
    if (target) {
      // Find the closest recording button and add a transformation class
      const button = target.closest('.recording-btn.narrowscreen')
      if (button) {
        button.classList.add('recording-btn-transform')
      }
    }
  }

  // Add global event listener for mouseup event if it's a mouse event
  if (e.pointerType === 'mouse') {
    document.addEventListener('pointerup', handleStopRecording)
  }
}

function handleMobileViewTransformEnd(e) {
  // Check if the event is a touchend event
  if (e.type === 'touchend') {
    const button = e.target.closest('.recording-btn.narrowscreen')
    if (button) {
      // Remove the transformation class from the recording button
      button.classList.remove('recording-btn-transform')
    }
  }

  // Remove global event listener for mouseup event if it's a mouse event
  if (e.pointerType === 'mouse') {
    document.removeEventListener('pointerup', handleStopRecording)
  }
}

// NOTE prevents right-click from triggering on hold when using Chrome devtools.
// See https://stackoverflow.com/questions/49092441/unwanted-right-click-with-in-browser-devtools
const recorderButtonNarrowscreen = ref(null)
const disableContextMenu = (e) => {
  e.preventDefault()
}

const finalTranscript = ref('')
const temporaryTranscript = ref('')

const emit = defineEmits(['recordingStarted', 'recordingStopped', 'temporaryTranscriptRendered'])

onMounted(async () => {
  // isMounted = true
  // await attachMicrophone()

  if (recorderButtonNarrowscreen.value) {
    recorderButtonNarrowscreen.value.addEventListener('contextmenu', disableContextMenu, true)
  }
  // document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // isMounted = false
  // stopMicrophoneStream(microphone.value.mediaStream)

  if (recorderButtonNarrowscreen.value)
    recorderButtonNarrowscreen.value.removeEventListener('contextmenu', disableContextMenu, true)
  // document.removeEventListener('visibilitychange', handleVisibilityChange)
})

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
)

// // NOTE The connection to Speechly is lost after about 1-3 minutes of mobile being put to sleep. In such cases, remounting the recorder button doesn't reestablish the connection, so need to reload the page
// const handleVisibilityChange = async () => {
//   // client.decoder.connectPromise changing from Promise to null is the only way to tell whether the Speechly connection has been lost
//   if (
//     isMobile &&
//     document.visibilityState === 'visible' &&
//     client.decoder.connectPromise === null
//   ) {
//     location.reload()
//   }
// }
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
