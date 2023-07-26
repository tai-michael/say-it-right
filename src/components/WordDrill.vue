<template>
  <ion-page>
    <div class="flex flex-col h-full justify-between content">
      <main class="p-3 flex flex-col h-full min-h-[65%] md:min-h-[50%] items-center pt-12">
        <div class="instructions">
          <TransitionFade>
            <!-- Using conditional so that the transition works -->
            <span v-if="testingWordOnly">Speak this word</span>
            <span v-else-if="testingSentences">Speak this sentence</span>
          </TransitionFade>
        </div>

        <ion-card v-if="wordName" class="max-w-xs mt-7 pr-2 pl-2">
          <div class="word-container">
            <!-- <div class="word" :class="{ 'word-highlight': highlightActive }"> -->
            <TransitionFade>
              <div :key="wordName" class="word">
                {{ wordName }}
              </div>
            </TransitionFade>
            <PlayAudioIcon @click="play" />
          </div>
          <!-- <div class="checkmark-container" v-if="highlightActive">
            <transition name="fade" mode="out-in" appear>
              <CheckmarkIcon class="checkmark" />
            </transition>
          </div> -->
        </ion-card>

        <TransitionFade>
          <div v-if="testingSentences">
            <!-- <ul>
            <li v-for="(sentence, index) of sentences" :key="index" class="sentences">
               {{ sentence }}
              </li>
            </ul> -->
            <ion-card class="p-5 max-w-xs mt-3 mb-4">
              <TransitionFade>
                <div :key="testedSentence" class="sentence">
                  {{ testedSentence }}
                </div>
              </TransitionFade>
            </ion-card>
          </div>

          <div v-else-if="recordingStatus === 'TESTING_COMPLETE'">
            <!-- <TransitionFade> -->
            <div v-if="relatedWords.length" class="flex mt-4">
              <!-- TODO need to add a message here, like 'Loading word, please wait...' -->

              <span v-if="isLoadingRelatedWord" class="mt-9 mb-4 w-36 ml-10 loading-text">{{
                loadingText
              }}</span>
              <!-- <LoadingDots class="mt-2" /> -->

              <div v-else>
                <!-- <TransitionFade> -->
                <ion-card class="mt-3 mb-4 card min-w-[270px] sm:min-w-[380px] related-words">
                  <div class="flex pl-2 pr-2">
                    <div v-for="(word, index) of relatedWords" :key="index" class="w-full">
                      <span @click="handleRelatedWordClick(word)" class="related-word">{{
                        word
                      }}</span>
                    </div>
                  </div>
                </ion-card>
                <!-- </TransitionFade> -->
              </div>
            </div>
            <!-- </TransitionFade> -->
          </div>
        </TransitionFade>
      </main>

      <div class="message-container h-full max-h-80 pt-10 pl-5 pr-5">
        <TransitionFade>
          <div v-if="isRecording" class="transcript flex justify-center">
            <!-- :class="[testingWordOnly ? 'transcript__single-word' : 'transcript-multiple-words']" -->
            <div class="transcript__text">
              <label v-if="!testingWordOnly">Spoken Words:</label>
              <span>
                {{
                  `${testingWordOnly ? 'Spoken Words:' : ''} ${
                    temporaryTranscript.length > 0 ? '“' : ''
                  }${temporaryTranscript}${temporaryTranscript.length > 0 ? '”' : ''}`
                }}</span
              >
            </div>
          </div>

          <div v-else class="message">
            <div v-if="recordingStatus === 'NOTHING_RECORDED'"></div>
            <div v-if="recordingStatus === 'PRONOUNCED_CORRECTLY_ONCE'" class="message__text">
              <span>Good job! 👍</span>
              <span>
                Now read
                {{ testingWordOnly ? 'it just one more time' : 'the second sentence' }}</span
              >
            </div>
            <div v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_TWICE'" class="message__text">
              <span>Well done! 👍</span>
              <span>{{ testingWordOnly ? 'Now try reading some sentences' : '' }}</span>
            </div>
            <div v-else-if="recordingStatus === 'PRONOUNCED_INCORRECTLY'" class="message__text">
              <span>Try again</span>
            </div>
            <!-- <div v-else-if="recordingStatus === 'SKIPPING_WORD'" class="message">
              <span>Let's skip this word for now</span>
            </div> -->
            <div v-else-if="recordingStatus === 'TESTING_COMPLETE'" class="message__text">
              <span v-if="relatedWords.length">Practice with a similar word!</span>
              <span
                ><span v-if="relatedWords.length">Or </span>
                <span @click="resetWord" class="link">Retry</span> this word.</span
              >
            </div>
          </div>
        </TransitionFade>
      </div>
    </div>

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

    <!-- <ion-button
      v-if="props.list.words[word].attemptsSuccessful === 2"
      @click="store.setListStatus('TESTING_SENTENCES')"
    >
      Next
    </ion-button> -->
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
// import type { Ref } from 'vue'
import type { PropType } from 'vue'
import type { WordObject } from '@/stores/modules/types/Review'
import RecorderButton from './RecorderButton.vue'
import PlayAudioIcon from '@/assets/icons/play-audio.vue'
import LoadingDots from '@/components/LoadingDots.vue'
import TransitionFade from '@/components/transitions/TransitionFade.vue'
import useTextToSpeechCreationAndStorage from '@/composables/useTextToSpeechCreationAndStorage.ts'
import useCheckPronunciationOfWordByItself from '@/composables/useCheckPronunciationOfWordByItself.ts'
import useCheckPronunciationOfWordInSentences from '@/composables/useCheckPronunciationOfWordInSentences.ts'
import useRelatedWordsCreationAndStorage from '@/composables/useRelatedWordsCreationAndStorage.ts'
import useSentencesCreationAndStorage from '@/composables/useSentencesCreationAndStorage.ts'
import useDelay from '@/composables/useDelay'
import { metaphone } from 'metaphone'
import { useRoute } from 'vue-router'
import type { WordSource } from '@/stores/modules/types/Review'
import { useReviewStore } from '@/stores/index.ts'
import { IonPage, IonCard } from '@ionic/vue'
// import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useReviewStore()

const props = defineProps({
  word: { type: Object as PropType<WordObject>, required: true }
})

const relatedWords = ref<string[]>([...props.word.related_words])
const emits = defineEmits(['related-word-clicked', 'loading-related-word'])
const reviewEntered = inject('reviewEntered')

// const word: Ref<WordObject | null> = ref(null)
// NOTE creates a reactive variable
// const { word } = toRefs(props)

const resetWord = () => {
  word.value.attempts = 0
  word.value.attemptsSuccessful = 0
  word.value.status = 'TESTING_WORD_ONLY'
}

onMounted(() => {
  // console.log('Word Drill mounted')
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
  useTextToSpeechCreationAndStorage(testedWordAudioText.value, 'female', 1)
}

const attemptsSuccessfulRequired = computed(() =>
  word.value.status === 'TESTING_WORD_ONLY' ? 2 : 4
)

const showRecorderButton = computed(
  () =>
    word.value.attemptsSuccessful < attemptsSuccessfulRequired.value &&
    (word.value.status === 'TESTING_WORD_ONLY' || word.value.status === 'TESTING_SENTENCES') &&
    reviewEntered.value
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
    // introductionNeeded.value = false
  }

  store.updateReviewInFirestore()
}

// const introductionNeeded = ref(true)

const handleCorrectPronunciation = async () => {
  if (word.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 2) {
    // NOTE when user answers correctly once, give them a couple more attempts
    // store.softResetAttempts(wordName.value)
    store.logPronunciationAttemptSuccessful(wordName.value)
    store.logPronunciationAttempt(wordName.value)
    // introductionNeeded.value = false
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
      // introductionNeeded.value = true

      if (relatedWords.value.length > 0) return
      relatedWords.value = await useRelatedWordsCreationAndStorage(wordName.value)
      store.addRelatedWords(wordName.value, relatedWords.value)
      store.updateReviewInFirestore()
    } else {
      clearTempAndFinalTranscripts()
      // REVIEW not sure if below line is needed
      isPronouncedCorrectly.value = false
      // store.setWordStatus(word.value, 'TESTING_COMPLETE')
      word.value.status = 'TESTING_COMPLETE'
      // introductionNeeded.value = true
    }
  }
}

const animationIndex = ref(0)
const loadingText = computed(() => {
  return isLoadingRelatedWord.value ? `Loading word${'.'.repeat(animationIndex.value)}` : ''
})

const isLoadingRelatedWord = ref(false)
const handleRelatedWordClick = async (relatedWord: string) => {
  isLoadingRelatedWord.value = true
  emits('loading-related-word', true)
  const animatedDots = setInterval(() => {
    animationIndex.value = (animationIndex.value + 1) % 4
  }, 500)
  await useSentencesCreationAndStorage([relatedWord], route.name as WordSource)
  clearInterval(animatedDots)
  isLoadingRelatedWord.value = false
  emits('loading-related-word', false)
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
ion-page {
  --height: 100%;
}

.content {
  // @media only screen and (min-width: 768px) {
  //   margin-right: 456px;
  // }

  @media only screen and (min-width: 768px) and (max-width: 1088px) {
    min-width: 0rem;
    // width: 100%;
  }
}

main {
  background-color: #b9e5e1;

  @media only screen and (min-width: 768px) and (max-width: 850px) {
    margin-left: 400px;
  }

  @media only screen and (min-width: 851px) {
    margin-left: 456px;
    max-width: 1008px;
  }

  // @media only screen and (min-width: 768px) {
  //   padding-left: 300px !important;
  // }
}

.instructions {
  height: 19px;
}

.instructions,
.loading-text,
.message__text {
  font-weight: 600;
  color: rgb(80, 80, 80);
}

ion-card {
  --background: #eef9f8;
}

.word-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  column-gap: 0.5rem;
  padding: 1rem 2rem;

  .word {
    font-size: 24px;
  }
}

.sentence {
  font-size: 16px;
}

.message-container {
  background-color: #8ed6ce;

  @media only screen and (min-width: 768px) and (max-width: 850px) {
    margin-left: 400px;
  }

  @media only screen and (min-width: 851px) {
    margin-left: 456px;
    max-width: 1008px;
  }
}

.message {
  display: flex;
  justify-content: center;

  &__text {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    font-weight: 600;
  }
}

.transcript {
  padding-left: 25px;
  padding-right: 25px;

  &__text {
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
    width: 296px;

    @media only screen and (min-width: 768px) and (max-width: 880px) {
      width: 340px;
    }

    @media only screen and (min-width: 881px) {
      margin-left: 30px;
      width: 340px;
    }
  }
}

.related-words {
  @media only screen and (min-width: 768px) and (max-width: 850px) {
    min-width: 340px !important;
  }
}

.related-word {
  display: flex;
  justify-content: center;
  padding: 1rem 0.4rem;
  font-size: 16px;
  font-weight: 500;
}

.link,
.related-word {
  text-decoration: underline;
  cursor: pointer;
  color: rgb(84, 150, 226);
  transition: 0.2s;

  &:hover {
    // background-color: hsla(202, 100%, 37%, 0.1);
    color: rgb(126, 185, 253);
  }
}

body.dark {
  main {
    background-color: rgb(34, 34, 34);
  }

  .message-container {
    background-color: rgb(30, 30, 30);
  }

  ion-card {
    --background: rgb(48, 48, 48);
  }

  .instructions,
  .word,
  .sentence,
  .loading-text,
  .transcript__text,
  .message__text {
    // color: rgb(225, 225, 225);
    color: rgb(196, 196, 196);
  }

  // ion-button {
  //   --background: #414141;
  //   --background-hover: #4e4e4e;
  //   color: rgb(196, 196, 196);
  // }
}
</style>
