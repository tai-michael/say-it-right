<template>
  <main>
    <div class="word-and-sentences">
      <div class="word">
        <!-- <div class="word" :class="{ 'word-highlight': highlightActive }"> -->
        <div class="word__text">
          {{ wordName }}
        </div>
        <PlayAudioIcon @click="play" />
      </div>
      <!-- <div class="checkmark-container" v-if="highlightActive">
      <transition name="fade" mode="out-in" appear>
        <CheckmarkIcon class="checkmark" />
      </transition>
    </div> -->

      <TransitionFade>
        <div v-if="recordingStatus === 'TESTING_COMPLETE'">
          <div v-if="relatedWords" class="related-words-container">
            <LoadingDots v-if="isLoading || !relatedWords.length" />
            <div v-else class="related-words">
              <div v-for="(word, index) of relatedWords" :key="index">
                <span @click="handleRelatedWordClick(word)" class="related-word">{{ word }}</span>
              </div>
            </div>
          </div>
        </div>
      </TransitionFade>

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
        <!-- <div v-else-if="recordingStatus === 'SKIPPING_WORD'" class="message__text">
          <span>Let's skip this word for now.</span>
        </div> -->
        <div v-else-if="recordingStatus === 'TESTING_COMPLETE'" class="message__text">
          <span>Practice with a similar word!</span>
          <span>Or <span @click="resetWord" class="retry-word">Retry</span> this word.</span>
        </div>
      </div>
    </TransitionFade>

    <!-- <RecorderButton
      v-if="showRecorderButton"
      @recording-started="handleRecordingStarted"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :challenge-status="props.list.status"
    /> -->

    <RecorderButton
      v-if="showRecorderButton"
      @recording-started="handleRecordingStarted"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
    />

    <!-- <button
      v-if="props.list.words[word].attemptsSuccessful === 2"
      @click="store.setListStatus('TESTING_SENTENCES')"
    >
      Next
    </button> -->
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, defineEmits } from 'vue'
// import type { Ref } from 'vue'
import type { PropType } from 'vue'
import type { WordObject } from '@/stores/modules/types/Review'
import RecorderButton from './RecorderButton.vue'
import PlayAudioIcon from '@/assets/icons/play-audio.vue'
import LoadingDots from '@/components/LoadingDots.vue'
import TransitionFade from '@/components/transitions/TransitionFade.vue'
import useTextToSpeechConverter from '@/composables/useTextToSpeechConverter.ts'
import useCheckPronunciationOfWordByItself from '@/composables/useCheckPronunciationOfWordByItself.ts'
import useCheckPronunciationOfWordInSentences from '@/composables/useCheckPronunciationOfWordInSentences.ts'
import useOpenAiRelatedWordsGenerator from '@/composables/useOpenAiRelatedWordsGenerator.ts'
import useSentencesCreationAndStorage from '@/composables/useSentencesCreationAndStorage.ts'
import useDelay from '@/composables/useDelay'
import { metaphone } from 'metaphone'
import { useRoute } from 'vue-router'
import type { WordSource } from '@/stores/modules/types/Review'
import { useReviewStore } from '@/stores/index.ts'
// import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useReviewStore()

const props = defineProps({
  word: { type: Object as PropType<WordObject>, required: true }
})

const relatedWords = ref<string[]>([...props.word.related_words])

const emits = defineEmits(['related-word-clicked'])

// const word: Ref<WordObject | null> = ref(null)
// NOTE creates a reactive variable
// const { word } = toRefs(props)

const resetWord = () => {
  word.value.attempts = 0
  word.value.attemptsSuccessful = 0
  word.value.status = 'TESTING_WORD_ONLY'
}

onMounted(() => {
  word.value = props.word
  resetWord()
})
// @ts-ignore
const word = ref<WordObject>({})
const wordName = computed(() => word.value.word)

const testingWordOnly = computed(() => word.value.status === 'TESTING_WORD_ONLY')
const testingSentences = computed(() => word.value.status === 'TESTING_SENTENCES')

const testedSentence = computed(() => {
  return word.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 2
    ? word.value.sentences[0]
    : word.value.sentences[1]
})

const testedWordAudioText = computed(
  () => `${wordName.value.slice(0, 1).toUpperCase() + wordName.value.slice(1)}.`
  // NOTE with how Eleven Labs works, adding '!' and making the word
  // all caps makes it louder
  // `${testedWordName.value.toUpperCase()}!`
)

const play = () => {
  useTextToSpeechConverter(testedWordAudioText.value, 'female', 1)
}

const attemptsSuccessfulRequired = computed(() =>
  word.value.status === 'TESTING_WORD_ONLY' ? 2 : 4
)

const showRecorderButton = computed(
  () =>
    word.value.attemptsSuccessful < attemptsSuccessfulRequired.value &&
    (word.value.status === 'TESTING_WORD_ONLY' || word.value.status === 'TESTING_SENTENCES')
)

const isRecording = ref(false)
const temporaryTranscript = ref('')
// REVIEW not sure if I need this in WordDrill

const handleRecordingStarted = () => {
  isRecording.value = true
  // NOTE clears the temporary and final transcripts of any residual transcripts
  clearTempAndFinalTranscripts()
}

const clearTempAndFinalTranscripts = () => {
  temporaryTranscript.value = ''
  finalTranscriptWords.value = []
}

const handleTempTranscriptRender = (transcript: string) => {
  // console.log(transcript)
  // NOTE this guard is necessary b/c the recorder cannot be deactivated between views
  if (props.word !== word.value) return

  // NOTE simply 'return' if I decide not to show transcript for Sentence Challenges
  if (testingSentences.value)
    return (temporaryTranscript.value = transcript.split(' ').slice(-8).join(' '))

  temporaryTranscript.value = transcript.split(' ').slice(-1).join(' ')

  const transcribedWordCode = getPhoneticCode(temporaryTranscript.value)
  const testedWordPhoneticCode = getPhoneticCode(wordName.value)
  if (transcribedWordCode === testedWordPhoneticCode) temporaryTranscript.value = wordName.value
}

const getPhoneticCode = (word: string) => {
  return metaphone(word)
}

const finalTranscriptWords = ref<string[]>([])
const isPronouncedCorrectly = ref(false)
// const matchingWord = ref('')

const handleFinalTranscript = async (transcript: string) => {
  isRecording.value = false

  if (!transcript || props.word !== word.value) return
  console.log(transcript)

  finalTranscriptWords.value = transcript.split(' ')

  if (testingWordOnly.value) {
    isPronouncedCorrectly.value = useCheckPronunciationOfWordByItself(
      finalTranscriptWords.value,
      wordName.value
    )
  } else
    isPronouncedCorrectly.value = useCheckPronunciationOfWordInSentences(
      finalTranscriptWords.value,
      wordName.value,
      testedSentence.value
    )

  console.log(isPronouncedCorrectly.value)

  if (isPronouncedCorrectly.value) {
    await handleCorrectPronunciation()
    // } else if (storeWord.value.attempts === attemptsLimit.value - 1) {
    //   await skipWord()
  } else {
    store.logPronunciationAttempt(wordName.value)
    introductionNeeded.value = false
  }

  store.updateReviewInFirestore()
}

const introductionNeeded = ref(true)

const handleCorrectPronunciation = async () => {
  if (word.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 2) {
    // NOTE when user answers correctly once, give them a couple more attempts
    // store.softResetAttempts(wordName.value)
    store.logPronunciationAttemptSuccessful(wordName.value)
    store.logPronunciationAttempt(wordName.value)
    introductionNeeded.value = false
    // if (testingSentences.value) {
    //   checkmarkActive.value = true
    //   setTimeout(() => {
    //     checkmarkActive.value = false
    //   }, 2000)
    // }
  } else if (word.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 1) {
    store.logPronunciationAttemptSuccessful(wordName.value)
    store.logPronunciationAttempt(wordName.value)

    await useDelay(2000)

    if (testingWordOnly.value) {
      clearTempAndFinalTranscripts()
      isPronouncedCorrectly.value = false
      // store.hardResetAttempts(wordName.value)
      // store.setWordStatus(word.value, 'TESTING_SENTENCES')
      word.value.status = 'TESTING_SENTENCES'
      introductionNeeded.value = true

      if (relatedWords.value.length > 0) return
      relatedWords.value = await useOpenAiRelatedWordsGenerator(wordName.value)
      store.addRelatedWords(wordName.value, relatedWords.value)
      store.updateReviewInFirestore()
    } else {
      clearTempAndFinalTranscripts()
      // REVIEW not sure if below line is needed
      isPronouncedCorrectly.value = false
      // store.setWordStatus(word.value, 'TESTING_COMPLETE')
      word.value.status = 'TESTING_COMPLETE'
      introductionNeeded.value = true
    }
  }
}

const isLoading = ref(false)
const handleRelatedWordClick = async (relatedWord: string) => {
  isLoading.value = true
  await useSentencesCreationAndStorage([relatedWord], route.name as WordSource)
  isLoading.value = false
  emits('related-word-clicked', relatedWord)
}

const recordingStatus = computed(() => {
  if (word.value.status === 'TESTING_COMPLETE') return 'TESTING_COMPLETE'
  if (isRecording.value) return 'IS_CURRENTLY_RECORDING'
  if (!finalTranscriptWords.value.length) return 'NOTHING_RECORDED'

  // const { attempts, attemptsSuccessful } = storeWord.value

  if (
    isPronouncedCorrectly.value &&
    word.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 1
  )
    return 'PRONOUNCED_CORRECTLY_ONCE'
  if (
    isPronouncedCorrectly.value &&
    word.value.attemptsSuccessful === attemptsSuccessfulRequired.value
  )
    return 'PRONOUNCED_CORRECTLY_TWICE'
  // if (attempts === attemptsLimit.value && attemptsSuccessful < attemptsSuccessfulRequired.value)
  //   return 'SKIPPING_WORD'
  return 'PRONOUNCED_INCORRECTLY'
})
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column !important;
  justify-content: center;
  // min-height: 700px;
  padding: 2rem 1rem 0.5rem;
  min-width: 380px;
  // height: 300px;
}
.word-and-sentences {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 0.5rem;
  height: 140px;
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

.related-words-container {
  display: flex;
  flex-direction: column;
  row-gap: 2rem;
  margin-top: 1rem;
  .related-words {
    display: flex;
    flex-direction: row;
    column-gap: 4rem;
  }
  .related-word {
    color: var(--green-color) !important;
    cursor: pointer;
    font-weight: 700;
  }
}

.retry-word {
  text-decoration: underline;
  color: var(--green-color) !important;
  cursor: pointer;
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
