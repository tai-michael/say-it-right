<template>
  <main>
    <div class="tested-word-container">
      <div class="tested-word" :class="{ 'correct-pronunciation': isPronouncedCorrectly }">
        {{ testedWord }}
      </div>
      <PlayAudioIcon @click="play" />
    </div>
    <!-- <div class="checkmark-container" v-if="isPronouncedCorrectly">
      <transition name="fade" mode="out-in" appear>
        <CheckmarkIcon class="checkmark" />
      </transition>
    </div> -->

    <div v-if="isRecording" class="transcript-container">
      <!-- <label>Live transcript:</label> -->
      <div>{{ temporaryTranscriptDisplay }}</div>
    </div>

    <div v-else class="message">
      <div v-if="recordingStatus === 'IS_CURRENTLY_RECORDING'"></div>
      <div v-else-if="recordingStatus === 'NOTHING_RECORDED'" class="message__text">
        <span v-if="introductionNeeded">Let's test your pronunciation of single words.</span>
        <span>Hold the button and read the word.</span>
      </div>
      <div v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_ONCE'" class="message__text">
        <span>Good job! Now read it just one more time.</span>
      </div>
      <div v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_TWICE'" class="message__text">
        <span>Good job! Now try reading some sentences.</span>
      </div>
      <div v-else-if="recordingStatus === 'PRONOUNCED_INCORRECTLY'" class="message__text">
        <span>Try again.</span>
      </div>
      <div v-else-if="recordingStatus === 'SKIPPING_WORD'" class="message__text">
        <span>Let's skip this word for now.</span>
      </div>
    </div>

    <RecorderButton
      v-if="showRecorderButton"
      @recording-started="handleRecordingStarted"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :challenge-status="props.list.status"
    />

    <!-- <button
      v-if="props.list.words[testedWord].attemptsSuccessful === 2"
      @click="store.setListStatus('SENTENCE_CHALLENGE_STARTED')"
    >
      Next
    </button> -->
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import PlayAudioIcon from '@/assets/images/play-audio.vue'
// import CheckmarkIcon from '@/assets/images/checkmark.vue'
import RecorderButton from './RecorderButton.vue'
import useTextToSpeechConverter from '@/composables/useTextToSpeechConverter.ts'
import useHardWordLogger from '@/composables/useHardWordLogger'
import { useRoute } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useCustomListsStore } from '@/stores/index.ts'

const route = useRoute()
const store = route.name === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

const props = defineProps({
  list: { type: Object, required: true }
})

const testedWords = ref<string[]>([])
const testedWord = computed(
  () => testedWords.value[0]
  // () => testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1)
)
const storeWord = computed(() => props.list.words[testedWord.value])

const testedWordAudioText = computed(
  () => `${testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1)}.`
  // NOTE with how Eleven Labs works, adding '!' and making the word
  // all caps makes it louder
  // `${testedWord.value.toUpperCase()}!`
)

const attemptsSuccessfulRequired = 2
const showRecorderButton = computed(
  () =>
    storeWord.value?.attemptsSuccessful < attemptsSuccessfulRequired &&
    storeWord.value?.attempts !== store.attemptsLimit
)

const handleRecordingStarted = () => {
  isRecording.value = true
  // NOTE clears the temporary and final transcripts of any residual transcripts
  temporaryTranscript.value = ''
  finalTranscriptWords.value = []
}

const play = () => {
  useTextToSpeechConverter(testedWordAudioText.value, 'female', 1)
}

const isRecording = ref(false)

const temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript: string) => {
  // NOTE this guard is necessary b/c the recorder cannot be deactivated between views
  if (store.activeList?.listNumber !== props.list.listNumber) return
  temporaryTranscript.value = transcript
}

const temporaryTranscriptDisplay = computed(() =>
  temporaryTranscript.value?.split(' ').slice(-8).join(' ')
)

const finalTranscriptWords = ref<string[]>([])
const finalTranscriptWord = computed(
  () => finalTranscriptWords.value[finalTranscriptWords.value.length - 1]
)

const isPronouncedCorrectly = ref(false)

const handleFinalTranscript = (transcript: string) => {
  isRecording.value = false
  if (!transcript || store.activeList?.listNumber !== props.list.listNumber) return

  finalTranscriptWords.value = transcript.split(' ')

  if (finalTranscriptWord.value === testedWord.value) {
    handleCorrectPronunciation()
  } else if (storeWord.value.attempts === store.attemptsLimit - 1) {
    skipWord()
  } else store.logPronunciationAttempt(testedWord.value)

  store.updateListsInFirestore()
}

const introductionNeeded = ref(true)

const handleCorrectPronunciation = () => {
  // NOTE triggers css change
  isPronouncedCorrectly.value = true
  setTimeout(() => {
    isPronouncedCorrectly.value = false
  }, 2000)

  if (storeWord.value.attemptsSuccessful === attemptsSuccessfulRequired - 2) {
    // NOTE when user answers correctly once, give them a couple more attempts
    store.softResetAttempts(testedWord.value)
    store.logPronunciationAttemptSuccessful(testedWord.value)
    store.logPronunciationAttempt(testedWord.value)
  } else if (storeWord.value.attemptsSuccessful === attemptsSuccessfulRequired - 1) {
    store.logPronunciationAttemptSuccessful(testedWord.value)
    store.logPronunciationAttempt(testedWord.value)

    setTimeout(() => {
      store.setListStatus('SENTENCE_CHALLENGE_STARTED')
      testedWords.value = testedWords.value.slice(1)
      introductionNeeded.value = false
    }, 2000)
  }
}

const skipWord = () => {
  store.logPronunciationAttempt(testedWord.value)
  useHardWordLogger(testedWord.value)
  setTimeout(() => {
    // TODO push/add testedWord to new array/object somewhere
    // and add to user's backend data as well (refer to how I replace providedList)
    testedWords.value = testedWords.value.slice(1)
    finalTranscriptWords.value = []
    introductionNeeded.value = false
  }, 2000)
}

const recordingStatus = computed(() => {
  if (isRecording.value) return 'IS_CURRENTLY_RECORDING'
  if (!finalTranscriptWords.value.length) return 'NOTHING_RECORDED'

  const { attempts, attemptsSuccessful } = storeWord.value

  if (finalTranscriptWord.value === testedWord.value && attemptsSuccessful === 1)
    return 'PRONOUNCED_CORRECTLY_ONCE'
  if (finalTranscriptWord.value === testedWord.value && attemptsSuccessful === 2)
    return 'PRONOUNCED_CORRECTLY_TWICE'
  if (attempts === store.attemptsLimit && attemptsSuccessful < 2) return 'SKIPPING_WORD'
  return 'PRONOUNCED_INCORRECTLY'
})

onMounted(() => {
  console.log(props.list)
  // @ts-ignore
  const mispronouncedParagraphWords = Object.fromEntries(
    // @ts-ignore
    Object.entries(props.list.words)
      /* eslint-disable @typescript-eslint/no-unused-vars  */
      /*  @ts-ignore */
      .filter(([_, wordObj]) => wordObj.attempts > wordObj.attemptsSuccessful)
      // NOTE sorts the array by the key in ascending order
      // so that testedWord remains the same word after reloading
      // @ts-ignore
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  )
  // TODO put skipped words in user's database
  // TODO on mount, generate the sentences, then push them to backend collection
  // TODO Implement hints, which I'll generate with GPT first. (e.g. v-if with attemptsSuccessful < attemptsSuccessfulRequired && attempts >= attemptsLimit - 3)

  testedWords.value = Object.keys(mispronouncedParagraphWords).filter(
    (word) =>
      mispronouncedParagraphWords[word].attempts < store.attemptsLimit &&
      mispronouncedParagraphWords[word].attemptsSuccessful < attemptsSuccessfulRequired
  )
})

// NOTE 'Next' button handler
// const handleNextButtonClick = () => {
//   // Increment successfulAttempts by 1
//   store.incrementSuccessfulAttempts(currentTestedWord.value)

//   // Move to the SentenceTest
//   store.setListStatus('SENTENCE_CHALLENGE_STARTED')
// }
</script>

<style lang="scss" scoped>
.tested-word-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  column-gap: 0.5rem;
  margin-bottom: 4rem;
  // NOTE enable below if I want to include checkmark
  // position: relative;
}

.tested-word {
  font-size: 24px;
  // Note that transition is applied here rather than in correct-pronunciation
  transition: color 0.2s ease-in-out;
}

.correct-pronunciation {
  color: green;
}

.message {
  margin-top: 1rem;
  min-height: 64px;
  // height: 50px;

  &__text {
    display: flex;
    flex-direction: column;
    span {
      padding-bottom: 0.5rem;
      font-weight: 600;
      color: var(--orange-color);
    }
  }
}

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

// .checkmark-container {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
// }

// .checkmark {
//   color: green;
// }

// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 0.2s;
// }

// .fade-enter,
// .fade-leave-to {
//   opacity: 0;
// }
</style>
