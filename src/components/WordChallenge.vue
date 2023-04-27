<template>
  <main>
    <div class="tested-word-container">
      <div class="tested-word">{{ testedWord }}</div>
      <PlayAudioIcon @click="play" />
    </div>

    <div v-if="isRecording" class="transcript-container">
      <label>Live transcript:</label>
      <div>{{ temporaryTranscriptDisplay }}</div>
    </div>

    <div v-else class="message">
      <div v-if="recordingStatus === 'IS_CURRENTLY_RECORDING'"></div>
      <div v-else-if="recordingStatus === 'NOTHING_RECORDED'" class="message__text">
        <span>Let's test your pronunciation of single words.</span>
        <span>Hold the button and read the word.</span>
      </div>
      <div v-else-if="recordingStatus === 'WORD_CORRECT_ONCE'" class="message__text">
        <span>Good job! Now read it just one more time.</span>
        <!-- <span>Let's test your pronunciation of other words that are commonly mispronounced.</span> -->
      </div>
      <div v-else-if="recordingStatus === 'WORD_CORRECT_TWICE'" class="message__text">
        <span>Good job! Now try reading some sentences.</span>
        <!-- <span>Let's test your pronunciation of other words that are commonly mispronounced.</span> -->
      </div>
      <div v-else-if="recordingStatus === 'WORD_INCORRECT'" class="message__text">
        <span>Try again.</span>
        <!-- <span>Next, let's practice pronouncing these words.</span> -->
      </div>
    </div>

    <!-- <div class="message">
      <div class="message__text"><span>Hold the button and read the word.</span></div>
    </div> -->

    <RecorderButton
      @recording-started="handleRecordingStarted"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :challenge-status="props.list.status"
    />

    <button @click="store.setListStatus('SENTENCE_CHALLENGE_STARTED')">Next</button>
  </main>
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from 'vue'

import PlayAudioIcon from '@/assets/images/play-audio.vue'
import RecorderButton from './RecorderButton.vue'
import useConvertTextToSpeech from '@/composables/useConvertTextToSpeech.ts'

import { useRoute } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useCustomListsStore } from '@/stores/index.ts'

const route = useRoute()
const store = route.name === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

const props = defineProps({
  list: { type: Object, required: true }
})

// onActivated(() => (finalTranscript.value = ''))

const handleRecordingStarted = () => {
  isRecording.value = true
  // NOTE clears the temporary transcript from any residual transcripts
  temporaryTranscript.value = ''
}

const testedWords = computed(() => {
  // @ts-ignore
  const mispronouncedParagraphWords = Object.fromEntries(
    // @ts-ignore
    Object.entries(props.list.words).filter(
      /* eslint-disable @typescript-eslint/no-unused-vars  */
      /*  @ts-ignore */
      ([_, wordObj]) => wordObj.attempts > 1 || wordObj.attemptsSuccessful === 0
    )
  )

  return Object.keys(mispronouncedParagraphWords).filter(
    (word) =>
      mispronouncedParagraphWords[word].attempts < 6 &&
      mispronouncedParagraphWords[word].attemptsSuccessful < 3
  )
})

const testedWord = computed(
  () => testedWords.value[0]
  // () => testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1)
)

const testedWordAudioText = computed(
  () => `${testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1)}.`
  // NOTE with how Eleven AI works, adding '!' and making the word
  // all caps makes it louder
  // `${testedWord.value.toUpperCase()}!`
)

const play = () => {
  useConvertTextToSpeech(testedWordAudioText.value, 'female', 1)
}

const isRecording = ref(false)

const temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript: string) => {
  // console.log(store.activeList?.listNumber)
  // console.log(props.list.listNumber)
  if (store.activeList?.listNumber === props.list.listNumber) {
    temporaryTranscript.value = transcript
    console.log(`word challenge: ${transcript}`)
  }
}

const temporaryTranscriptDisplay = computed(() =>
  temporaryTranscript.value?.split(' ').slice(-8).join(' ')
)

const finalTranscript = ref('')

const handleFinalTranscript = (transcript: string) => {
  isRecording.value = false
  if (!transcript) return
  finalTranscript.value = transcript
  console.log(finalTranscript.value)

  const finalTranscriptWords = finalTranscript.value.split(' ')
  if (finalTranscriptWords.includes(testedWord.value)) {
    successfulTries.value++
    // store.logPronunciationAttemptSuccessful(testedWord.value)
    console.log('logged successful tries')
  }
  // if (finalTranscript.value === testedWord.value)
  tries.value++
  finalTranscript.value = ''
}

const tries = ref<number>(0)
const successfulTries = ref<number>(0)

const recordingStatus = computed(() => {
  if (isRecording.value) return 'IS_CURRENTLY_RECORDING'
  else if (!temporaryTranscript.value && !tries.value)
    // else if (!finalTranscript.value.length)
    return 'NOTHING_RECORDED'
  // TODO replace successfulTries && tries with store values; or keep, if i want to save read and writes and only do at the end
  else if (temporaryTranscript.value === testedWord.value && successfulTries.value === 1)
    return 'WORD_CORRECT_ONCE'
  else if (temporaryTranscript.value === testedWord.value && successfulTries.value === 2)
    return 'WORD_CORRECT_TWICE'
  else return 'WORD_INCORRECT'
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
}
.tested-word {
  font-size: 24px;
}

.message {
  margin-top: 1rem;
  // height: 50px;

  &__text {
    display: flex;
    flex-direction: column;
    span {
      padding-bottom: 0.5rem;
      font-weight: 600;
      color: #ff7f5f;
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
</style>
