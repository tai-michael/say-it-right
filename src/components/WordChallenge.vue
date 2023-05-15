<template>
  <main>
    <div class="word-and-sentences">
      <div class="word">
        <!-- <div class="word" :class="{ 'word-highlight': highlightActive }"> -->
        <div class="word__text">
          {{ testedWord }}
        </div>
        <PlayAudioIcon @click="play" />
      </div>
      <!-- <div class="checkmark-container" v-if="highlightActive">
      <transition name="fade" mode="out-in" appear>
        <CheckmarkIcon class="checkmark" />
      </transition>
    </div> -->

      <TransitionFade>
        <div v-if="testingSentences">
          <!-- <ul>
        <li v-for="(sentence, index) of sentences" :key="index" class="sentences">
           {{ sentence }}
          </li>
        </ul> -->
          <TransitionFade>
            <div :key="testedSentence" class="sentence">
              <!-- <CheckmarkIcon class="checkmark" v-if="checkmarkActive" /> -->
              {{ testedSentence }}
            </div>
          </TransitionFade>
        </div>
      </TransitionFade>
    </div>

    <div
      v-if="isRecording"
      class="transcript"
      :class="[testingWordOnly ? 'transcript__single-word' : 'transcript-multiple-words']"
    >
      <!-- <label>Live transcript:</label> -->
      <div class="transcript__text">{{ temporaryTranscript }}</div>
    </div>

    <TransitionFade v-else>
      <div class="message">
        <div v-if="recordingStatus === 'IS_CURRENTLY_RECORDING'"></div>
        <div v-else-if="recordingStatus === 'NOTHING_RECORDED'" class="message__text">
          <span v-if="introductionNeeded"
            >Let's test your pronunciation of this word{{
              testingWordOnly ? '' : ' in sentences'
            }}.</span
          >
          <span>Hold the button and read the {{ testingWordOnly ? 'word' : 'sentence' }}.</span>
        </div>
        <div v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_ONCE'" class="message__text">
          <span
            >Good job 👍! Now read
            {{ testingWordOnly ? 'it just one more time' : 'the second sentence' }}.</span
          >
        </div>
        <div v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_TWICE'" class="message__text">
          <span>Well done 👍! {{ testingWordOnly ? 'Now try reading some sentences.' : '' }}</span>
        </div>
        <div v-else-if="recordingStatus === 'PRONOUNCED_INCORRECTLY'" class="message__text-retry">
          <span>Try again.</span>
        </div>
        <div v-else-if="recordingStatus === 'SKIPPING_WORD'" class="message__text">
          <span>Let's skip this word for now.</span>
        </div>
      </div>
    </TransitionFade>

    <RecorderButton
      v-if="showRecorderButton"
      @recording-started="handleRecordingStarted"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
    />

    <!-- <button
      v-if="props.list.words[testedWord].attemptsSuccessful === 2"
      @click="store.setListStatus('TESTING_SENTENCES')"
    >
      Next
    </button> -->
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TransitionFade from '@/components/transitions/TransitionFade.vue'
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import PlayAudioIcon from '@/assets/icons/play-audio.vue'
// import CheckmarkIcon from '@/assets/icons/checkmark.vue'
import RecorderButton from './RecorderButton.vue'
import useTextToSpeechConverter from '@/composables/useTextToSpeechConverter.ts'
import useCheckPronunciationOfWordByItself from '@/composables/useCheckPronunciationOfWordByItself.ts'
import useCheckPronunciationOfWordInSentences from '@/composables/useCheckPronunciationOfWordInSentences.ts'
import useHardWordLogger from '@/composables/useHardWordLogger'
import useDelay from '@/composables/useDelay'
import { metaphone } from 'metaphone'
import { useRoute } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useCustomListsStore } from '@/stores/index.ts'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = route.name === 'provided-list' ? useProvidedListsStore() : useCustomListsStore()
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

const testingWordOnly = computed(() => props.list.status === 'TESTING_WORD_ONLY')
const testingSentences = computed(() => props.list.status === 'TESTING_SENTENCES')

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

// const displayedSentence = ref('')

// watch(testedSentence, (newValue) => {
//   console.log(newValue)
//   if (newValue === sentences?.value[1])
//     setTimeout(() => {
//       displayedSentence.value = newValue
//     }, 1000)
//   // Adjust the delay as needed
//   else displayedSentence.value = newValue
//   console.log('watcher over')
// })

const testedWordAudioText = computed(
  () => `${testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1)}.`
  // NOTE with how Eleven Labs works, adding '!' and making the word
  // all caps makes it louder
  // `${testedWord.value.toUpperCase()}!`
)

const play = () => {
  useTextToSpeechConverter(testedWordAudioText.value, 'female', 1)
}

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

const isRecording = ref(false)
const temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript: string) => {
  // console.log(transcript)
  // NOTE this guard is necessary b/c the recorder cannot be deactivated between views
  if (store.activeList?.listNumber !== props.list.listNumber) return

  // NOTE simply 'return' if I decide not to show transcript for Sentence Challenges
  if (testingSentences.value)
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
const isPronouncedCorrectly = ref(false)
// const highlightActive = ref(false)
// const testedSentence = computed(() => {
//   if (sentences.value)
//     return storeWord?.value?.attemptsSuccessful === attemptsSuccessfulRequired.value - 2
//       ? sentences?.value[0]
//       : sentences?.value[1]
//   else return ''
// })

const handleFinalTranscript = async (transcript: string) => {
  isRecording.value = false

  if (!transcript || store.activeList?.listNumber !== props.list.listNumber) return
  console.log(transcript)

  finalTranscriptWords.value = transcript.split(' ')

  if (testingWordOnly.value)
    isPronouncedCorrectly.value = useCheckPronunciationOfWordByItself(
      finalTranscriptWords.value,
      testedWord.value
    )
  else
    isPronouncedCorrectly.value = useCheckPronunciationOfWordInSentences(
      finalTranscriptWords.value,
      testedWord.value,
      testedSentence.value
    )

  console.log(isPronouncedCorrectly.value)

  if (isPronouncedCorrectly.value) {
    await handleCorrectPronunciation()
  } else if (storeWord.value.attempts === attemptsLimit.value - 1) {
    await skipWord()
  } else {
    store.logPronunciationAttempt(testedWord.value)
    introductionNeeded.value = false
  }

  store.updateListsInFirestore()
}

// const checkmarkActive = ref(false)
const introductionNeeded = ref(true)

const handleCorrectPronunciation = async () => {
  // // NOTE triggers css change
  // highlightActive.value = true
  // // console.log(highlightActive.value)
  // setTimeout(() => {
  //   highlightActive.value = false
  //   // console.log(highlightActive.value)
  // }, 1500)

  if (storeWord.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 2) {
    // NOTE when user answers correctly once, give them a couple more attempts
    store.softResetAttempts(testedWord.value)
    store.logPronunciationAttemptSuccessful(testedWord.value)
    store.logPronunciationAttempt(testedWord.value)
    introductionNeeded.value = false
    // if (testingSentences.value) {
    //   checkmarkActive.value = true
    //   setTimeout(() => {
    //     checkmarkActive.value = false
    //   }, 2000)
    // }
  } else if (storeWord.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 1) {
    store.logPronunciationAttemptSuccessful(testedWord.value)
    store.logPronunciationAttempt(testedWord.value)

    await useDelay(2000)

    if (testingWordOnly.value) {
      clearTempAndFinalTranscripts()
      isPronouncedCorrectly.value = false
      store.hardResetAttempts(testedWord.value)
      store.setListStatus('TESTING_SENTENCES')
    } else {
      // checkmarkActive.value = true
      // setTimeout(() => {
      //   checkmarkActive.value = false
      // }, 1000)

      if (testedWords.value.length === 1) return store.setListStatus('LIST_COMPLETE')
      clearTempAndFinalTranscripts()
      isPronouncedCorrectly.value = false
      testedWords.value = testedWords.value.slice(1)
      store.setListStatus('TESTING_WORD_ONLY')
    }

    // clearTempAndFinalTranscripts()
    introductionNeeded.value = true
  }
}

const getPhoneticCode = (word: string) => {
  return metaphone(word)
}

const skipWord = async () => {
  store.logPronunciationAttempt(testedWord.value)
  useHardWordLogger(testedWord.value)

  await useDelay(2000)

  testedWords.value = testedWords.value.slice(1)
  if (testedWords.value.length > 0) store.setListStatus('TESTING_WORD_ONLY')
  else store.setListStatus('LIST_COMPLETE')

  clearTempAndFinalTranscripts()
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
//   store.setListStatus('TESTING_SENTENCES')
// }
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 300px;
}
.word-and-sentences {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 2.5rem;
  height: 130px;
  margin-bottom: 2rem;
}
.word {
  display: flex;
  flex-direction: row;
  justify-content: center;
  column-gap: 0.5rem;
  margin-bottom: 2rem;
  // NOTE enable below if I want to include checkmark
  // position: relative;

  &__text {
    font-size: 24px;
    // // Note that if I want to highlight the word, the transition is applied here rather than in word-highlight
    // transition: color 0.2s ease-in-out;
  }
}

// .word-highlight {
//   color: green;
// }

.message {
  display: flex;
  justify-content: center;
  // margin-top: 2rem;
  min-height: 64px;
  // height: 50px;

  &__text,
  &__text-retry {
    display: flex;
    flex-direction: column;
    span {
      padding-bottom: 0.5rem;
      font-weight: 600;
      color: var(--orange-color);
    }
  }

  &__text-retry {
    margin-left: -40px;
  }
}

.transcript {
  // margin-top: 4rem;
  display: flex;
  min-height: 64px;
  padding: 0 30px;

  &__single-word {
    justify-content: center;
    margin-left: -40px;
  }

  &__multiple-words {
    justify-content: none;
  }
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
  // margin-bottom: 1rem;
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

// .checkmark {
//   height: 20px;
//   width: 20px;
//   margin-top: 2px;
//   margin-right: 8px;
//   color: green;
//   transition: opacity 0.2s;
// }
</style>
