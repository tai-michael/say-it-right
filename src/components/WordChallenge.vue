<template>
  <main>
    <div class="tested-word-container">
      <div class="tested-word" :class="{ 'word-highlight': highlightActive }">
        {{ testedWord }}
      </div>
      <PlayAudioIcon @click="play" />
    </div>
    <!-- <div class="checkmark-container" v-if="highlightActive">
      <transition name="fade" mode="out-in" appear>
        <CheckmarkIcon class="checkmark" />
      </transition>
    </div> -->

    <Transition name="fade" mode="in-out">
      <div v-if="sentenceChallengeActive">
        <!-- <ul>
        <li v-for="(sentence, index) of sentences" :key="index" class="sentences">
           {{ sentence }}
        </li>
      </ul> -->
        <div class="sentence">
          <CheckmarkIcon class="checkmark" v-if="checkmarkActive" />
          <Transition name="fade" mode="out-in">{{ displayedSentence }}</Transition>
        </div>
      </div>
    </Transition>

    <div v-if="isRecording" class="transcript-container">
      <!-- <label>Live transcript:</label> -->
      <div>{{ temporaryTranscript }}</div>
    </div>

    <div v-else class="message">
      <div v-if="recordingStatus === 'IS_CURRENTLY_RECORDING'"></div>
      <div v-else-if="recordingStatus === 'NOTHING_RECORDED'" class="message__text">
        <span v-if="introductionNeeded"
          >Let's test your pronunciation of this word
          {{ wordChallengeActive ? ' ' : 'in sentences' }}.</span
        >
        <span>Hold the button and read the {{ wordChallengeActive ? 'word' : 'sentence' }}.</span>
      </div>
      <div v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_ONCE'" class="message__text">
        <span
          >Good job! Now read
          {{ wordChallengeActive ? 'it just one more time.' : 'the second sentence' }}</span
        >
      </div>
      <div v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_TWICE'" class="message__text">
        <span>Well done! {{ wordChallengeActive ? 'Now try reading some sentences.' : '' }}</span>
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
import { computed, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import PlayAudioIcon from '@/assets/images/play-audio.vue'
import CheckmarkIcon from '@/assets/images/checkmark.vue'
import RecorderButton from './RecorderButton.vue'
import useTextToSpeechConverter from '@/composables/useTextToSpeechConverter.ts'
import useHardWordLogger from '@/composables/useHardWordLogger'
import { metaphone } from 'metaphone'
import stem from 'wink-porter2-stemmer'
import { useRoute } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useCustomListsStore } from '@/stores/index.ts'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = route.name === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()
const { attemptsLimit, attemptsSuccessfulRequired } = storeToRefs(store)

const props = defineProps({
  list: { type: Object as PropType<List>, required: true }
})

onMounted(() => {
  // console.log(props.list)
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
  // TODO Implement hints, which I'll generate with GPT first. (e.g. v-if with attemptsSuccessful < attemptsSuccessfulRequired.value && attempts >= attemptsLimit.value - 3)

  testedWords.value = Object.keys(mispronouncedParagraphWords).filter(
    (word) =>
      mispronouncedParagraphWords[word].attempts < attemptsLimit.value &&
      mispronouncedParagraphWords[word].attemptsSuccessful < attemptsSuccessfulRequired.value
  )

  // sentences.value = [...props?.list?.words[testedWord.value]?.sentences]
})

const wordChallengeActive = computed(() => props.list.status === 'WORD_CHALLENGE_STARTED')
const sentenceChallengeActive = computed(() => props.list.status === 'SENTENCE_CHALLENGE_STARTED')

const testedWords = ref<string[]>([])
const testedWord = computed(
  () => testedWords.value[0]
  // () => testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1)
)
const storeWord = computed(() => props.list.words[testedWord.value])

// const sentences = ref<string[]>([])
// const testedSentence = computed(() => sentences?.value[0])

const sentences = computed(() => props?.list?.words[testedWord.value]?.sentences)
const testedSentence = computed(() => {
  if (sentences.value)
    return storeWord?.value?.attemptsSuccessful === attemptsSuccessfulRequired.value - 2
      ? sentences?.value[0]
      : sentences?.value[1]
  else return ''
})

const displayedSentence = ref('')

watch(testedSentence, (newValue) => {
  console.log(newValue)
  if (newValue === sentences?.value[1])
    setTimeout(() => {
      displayedSentence.value = newValue
    }, 2000)
  // Adjust the delay as needed
  else displayedSentence.value = newValue
  console.log('watcher over')
})

const testedWordAudioText = computed(
  () => `${testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1)}.`
  // NOTE with how Eleven Labs works, adding '!' and making the word
  // all caps makes it louder
  // `${testedWord.value.toUpperCase()}!`
)

const showRecorderButton = computed(
  () =>
    storeWord.value?.attemptsSuccessful < attemptsSuccessfulRequired.value &&
    storeWord.value?.attempts !== attemptsLimit.value
)

const handleRecordingStarted = () => {
  isRecording.value = true
  // NOTE clears the temporary and final transcripts of any residual transcripts
  clearTempAndFinalTranscripts()
}

const clearTempAndFinalTranscripts = () => {
  temporaryTranscript.value = ''
  finalTranscriptWords.value = []
}

const play = () => {
  useTextToSpeechConverter(testedWordAudioText.value, 'female', 1)
}

const isRecording = ref(false)

const temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript: string) => {
  // console.log(transcript)
  // NOTE this guard is necessary b/c the recorder cannot be deactivated between views
  if (store.activeList?.listNumber !== props.list.listNumber) return

  // NOTE simply 'return' if I decide not to show transcript for Sentence Challenges
  if (!wordChallengeActive.value)
    return (temporaryTranscript.value = transcript.split(' ').slice(-8).join(' '))

  temporaryTranscript.value = transcript.split(' ').slice(-1).join(' ')

  const transcribedWordCode = getPhoneticCode(temporaryTranscript.value)
  const testedWordPhoneticCode = getPhoneticCode(testedWord.value)
  if (transcribedWordCode === testedWordPhoneticCode) temporaryTranscript.value = testedWord.value
}

// const temporaryTranscriptDisplay = computed(() =>
//   temporaryTranscript.value?.split(' ').slice(-8).join(' ')
// )

const finalTranscriptWords = ref<string[]>([])
const finalTranscriptWord = ref('')
const highlightActive = ref(false)
const isPronouncedCorrectly = ref(false)
// const testedSentence = computed(() => {
//   if (sentences.value)
//     return storeWord?.value?.attemptsSuccessful === attemptsSuccessfulRequired.value - 2
//       ? sentences?.value[0]
//       : sentences?.value[1]
//   else return ''
// })

const handleFinalTranscript = (transcript: string) => {
  isRecording.value = false
  if (!transcript || store.activeList?.listNumber !== props.list.listNumber) return

  if (wordChallengeActive.value)
    isPronouncedCorrectly.value = checkPronunciationOfWordByItself(transcript)
  else isPronouncedCorrectly.value = checkPronunciationOfWordInSentences(transcript)

  console.log(isPronouncedCorrectly.value)

  if (isPronouncedCorrectly.value) {
    handleCorrectPronunciation()
  } else if (storeWord.value.attempts === attemptsLimit.value - 1) {
    skipWord()
  } else store.logPronunciationAttempt(testedWord.value)

  store.updateListsInFirestore()
}

const checkPronunciationOfWordByItself = (transcript: string) => {
  console.log(transcript)
  finalTranscriptWords.value = transcript.split(' ')
  finalTranscriptWord.value = finalTranscriptWords.value[finalTranscriptWords.value.length - 1]

  const transcribedWordCode = getPhoneticCode(finalTranscriptWord.value)
  const testedWordPhoneticCode = getPhoneticCode(testedWord.value)

  if (transcribedWordCode === testedWordPhoneticCode) {
    finalTranscriptWord.value = testedWord.value
    console.log('true')
    return true
  }
  console.log('false')
  return false
}

const checkmarkActive = ref(false)

const checkPronunciationOfWordInSentences = (transcript: string) => {
  const transcriptWords = transcript.split(' ')
  const testedWordPhoneticCode = getPhoneticCode(testedWord.value)
  const sentence = testedSentence.value.split(' ')
  // console.log(transcriptWords)
  // console.log(testedWordPhoneticCode)

  for (const transcriptWord of transcriptWords) {
    const transcriptWordPhoneticCode = metaphone(transcriptWord)
    // console.log(transcriptWordPhoneticCode)
    if (testedWordPhoneticCode === transcriptWordPhoneticCode) {
      console.log('true')
      return true
    }
  }

  // NOTE need this extra check, as sometimes the sentences generated by openAI are modified forms of the tested word (e.g. 'chatted' instead of 'chatting')
  for (const sentenceWord of sentence) {
    const sentenceWordStem = stem(sentenceWord)
    for (const transcriptWord of transcriptWords) {
      const transcriptWordStem = stem(transcriptWord)
      // console.log(sentenceWordStem)
      // console.log(transcriptWordStem)
      if (sentenceWordStem === transcriptWordStem) {
        // console.log('stem true')
        return true
      }
    }
  }

  console.log('false')
  return false
}

const introductionNeeded = ref(true)

const handleCorrectPronunciation = () => {
  // NOTE triggers css change
  highlightActive.value = true
  console.log(highlightActive.value)
  setTimeout(() => {
    highlightActive.value = false
    console.log(highlightActive.value)
  }, 2000)

  if (storeWord.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 2) {
    // NOTE when user answers correctly once, give them a couple more attempts
    store.softResetAttempts(testedWord.value)
    store.logPronunciationAttemptSuccessful(testedWord.value)
    store.logPronunciationAttempt(testedWord.value)
    if (sentenceChallengeActive.value) {
      checkmarkActive.value = true
      setTimeout(() => {
        checkmarkActive.value = false
      }, 2000)
    }
  } else if (storeWord.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 1) {
    store.logPronunciationAttemptSuccessful(testedWord.value)
    store.logPronunciationAttempt(testedWord.value)

    // await delay(2000)

    if (wordChallengeActive.value) {
      store.setListStatus('SENTENCE_CHALLENGE_STARTED')
      store.hardResetAttempts(testedWord.value)
      isPronouncedCorrectly.value = false
    } else {
      testedWords.value = testedWords.value.slice(1)
      // TODO ask chatGPT if there's any other way. Like if my computed changes, to delay it or anything.
      // sentences.value = [...props?.list?.words[testedWord.value]?.sentences]
      if (!testedWords.value.length) return store.setListStatus('LIST_COMPLETED')
      store.setListStatus('WORD_CHALLENGE_STARTED')
    }

    clearTempAndFinalTranscripts()
    introductionNeeded.value = false
  }
}

const delay = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

// NOTE convert any mistranscribed word to the tested word if they sound the same
const getPhoneticCode = (word: string) => {
  return metaphone(word)
}

const skipWord = () => {
  store.logPronunciationAttempt(testedWord.value)
  useHardWordLogger(testedWord.value)

  // await delay(2000)
  // TODO push/add testedWord to new array/object somewhere
  // and add to user's backend data as well (refer to how I replace providedList)
  store.setListStatus('WORD_CHALLENGE_STARTED')
  testedWords.value = testedWords.value.slice(1)
  finalTranscriptWords.value = []
  introductionNeeded.value = false
}

const recordingStatus = computed(() => {
  if (isRecording.value) return 'IS_CURRENTLY_RECORDING'
  if (!finalTranscriptWords.value.length) return 'NOTHING_RECORDED'

  const { attempts, attemptsSuccessful } = storeWord.value

  if (isPronouncedCorrectly.value && attemptsSuccessful === attemptsSuccessfulRequired.value - 1)
    return 'PRONOUNCED_CORRECTLY_ONCE'
  if (isPronouncedCorrectly.value && attemptsSuccessful === attemptsSuccessfulRequired.value)
    return 'PRONOUNCED_CORRECTLY_TWICE'
  if (attempts === attemptsLimit.value && attemptsSuccessful < attemptsSuccessfulRequired.value)
    return 'SKIPPING_WORD'
  return 'PRONOUNCED_INCORRECTLY'
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
  margin-bottom: 2rem;
  // NOTE enable below if I want to include checkmark
  // position: relative;
}

.tested-word {
  font-size: 24px;
  // Note that transition is applied here rather than in word-highlight
  transition: color 0.2s ease-in-out;
}

.word-highlight {
  transition: green;
}

.message {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
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
  margin-top: 4rem;
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

.sentence {
  display: flex;
  padding: 0 1.5rem;
  margin-bottom: 1rem;
  // align-items: center;
}
// .checkmark-container {
// display: flex;
// justify-content: center;
// align-items: center;
// position: absolute;
// top: 0;
// left: 0;
// right: 0;
// bottom: 0;
// }

.checkmark {
  height: 20px;
  width: 20px;
  margin-top: 2px;
  margin-right: 8px;
  color: green;
  transition: opacity 0.2s;
}

// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 0.2s;
// }

// .fade-enter,
// .fade-leave-to {
//   opacity: 0;
// }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
