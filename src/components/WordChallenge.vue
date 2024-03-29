<template>
  <ion-page>
    <div class="h-full outer-container">
      <div class="flex flex-col h-full justify-between challenge-container">
        <!-- <main class="p-4 flex flex-col w-full h-full min-h-[60%] items-center justify-center gap-y-4"> -->
        <main
          class="p-3 flex flex-col h-full min-h-[55%] md:min-h-[50%] items-center pt-12"
          :class="{ 'pt-8': testedSentence?.length > 80 }"
        >
          <div class="instructions">
            <TransitionFade>
              <!-- Using conditional so that the transition works -->
              <span v-if="testingWordOnly">{{
                $t('word_practice.general_instructions_word')
              }}</span>
              <span v-else-if="testingSentences">{{
                $t('word_practice.general_instructions_sentence')
              }}</span>
            </TransitionFade>
          </div>

          <ion-card
            v-if="testedWord"
            class="max-w-xs mt-7 pr-2 pl-2"
            :class="{ '!mt-4': testedSentence?.length > 50 }"
          >
            <div class="word-container">
              <!-- <div class="word" :class="{ 'word-highlight': highlightActive }"> -->
              <!-- NOTE a key is needed for transition in a computed property, but is unneeded if there's a conditional -->
              <TransitionFade>
                <div :key="testedWord" class="word">
                  {{ testedWord }}
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

          <!-- <TransitionFade class="mb-3">
          <div :key="testedSentence" class="sentence">
            {{ testedSentence }}
          </div>
        </TransitionFade> -->

          <TransitionFade>
            <div v-if="testingSentences">
              <ion-card class="p-5 max-w-xs mt-3 mb-4">
                <TransitionFade>
                  <div :key="testedSentence" class="sentence">
                    {{ testedSentence }}
                  </div>
                </TransitionFade>
              </ion-card>
            </div>
          </TransitionFade>
        </main>

        <div class="message-container h-full pt-10 pl-5 pr-5">
          <!-- TODO remove transition below depending on user feedback; IMO, transitions make it feel smoother but also slower -->
          <TransitionFade>
            <div v-if="isRecording" class="transcript flex justify-center">
              <!-- :class="[testingWordOnly ? 'transcript__single-word' : 'transcript-multiple-words']" -->
              <div class="transcript__text">
                <label v-if="!testingWordOnly">{{ $t('word_practice.spoken_words_label') }}</label>
                <span>
                  {{
                    `${testingWordOnly ? $t('word_practice.spoken_words_label') : ''} ${
                      temporaryTranscript.length > 0 ? '“' : ''
                    }${temporaryTranscript}${temporaryTranscript.length > 0 ? '”' : ''}`
                  }}</span
                >
              </div>
            </div>

            <div v-else class="message">
              <div v-if="recordingStatus === 'NOTHING_RECORDED'"></div>
              <div v-if="recordingStatus === 'PRONOUNCED_CORRECTLY_ONCE'" class="message__text">
                <span>{{ $t('word_practice.message.correct_once1') }}</span>
                <span>
                  {{ $t('word_practice.message.correct_once2') }}
                  {{
                    testingWordOnly
                      ? $t('word_practice.message.correct_once3_word')
                      : $t('word_practice.message.correct_once3_sentence')
                  }}</span
                >
              </div>
              <div
                v-else-if="recordingStatus === 'PRONOUNCED_CORRECTLY_TWICE'"
                class="message__text"
              >
                <span>{{ $t('word_practice.message.correct_twice1') }}</span>
                <span>{{ testingWordOnly ? $t('word_practice.message.correct_twice2') : '' }}</span>
              </div>
              <div v-else-if="recordingStatus === 'PRONOUNCED_INCORRECTLY'" class="message__text">
                <span>{{ $t('word_practice.message.incorrect') }}</span>
              </div>
              <div v-else-if="recordingStatus === 'SKIPPING_WORD'" class="message__text">
                <span>{{ $t('word_practice.message.skip') }}</span>
              </div>
            </div>
          </TransitionFade>
        </div>
      </div>

      <RecorderButton
        v-if="showRecorderButton"
        @recording-started="handleRecordingStarted"
        @recording-stopped="handleFinalTranscript"
        @temporary-transcript-rendered="handleTempTranscriptRender"
      />

      <!-- <ion-button
      v-if="props.list.words[testedWord].attemptsSuccessful === 2"
      @click="store.setListStatus('TESTING_SENTENCES')"
    >
      Next
    </ion-button> -->
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, inject } from 'vue'
import { storeToRefs } from 'pinia'
import TransitionFade from '@/components/transitions/TransitionFade.vue'
import { IonPage, IonCard } from '@ionic/vue'
import PlayAudioIcon from '@/assets/icons/play-audio.vue'
import RecorderButton from './RecorderButton.vue'
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
// import CheckmarkIcon from '@/assets/icons/checkmark.vue'
import { useTextToSpeechCreationAndStorage } from '@/composables/useTextToSpeechCreationAndStorage.ts'
import useCheckPronunciationOfWordByItself from '@/composables/useCheckPronunciationOfWordByItself.ts'
import useCheckPronunciationOfWordInSentences from '@/composables/useCheckPronunciationOfWordInSentences.ts'
import useHardWordLogger from '@/composables/useHardWordLogger'
import usePhoneticConverter from '@/composables/usePhoneticConverter'
import useDelay from '@/composables/useDelay'
import { useCustomListsStore, usePremadeListsStore } from '@/stores/index.ts'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = route.name === 'premade-list' ? usePremadeListsStore() : useCustomListsStore()
const { attemptsLimit, attemptsSuccessfulRequired } = storeToRefs(store)

const props = defineProps({
  list: { type: Object as PropType<List>, required: true }
})

const listEntered = inject('listEntered')

onMounted(() => {
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

  // final condition below filters out words that failed the word challenge (i.e.skipped)
  testedWords.value = Object.keys(mispronouncedParagraphWords).filter(
    (word) =>
      mispronouncedParagraphWords[word].attempts < attemptsLimit.value &&
      mispronouncedParagraphWords[word].attemptsSuccessful < attemptsSuccessfulRequired.value &&
      !(
        mispronouncedParagraphWords[word].attempts >= 6 &&
        mispronouncedParagraphWords[word].attemptsSuccessful < 2
      )
  )

  // sentences.value = [...props?.list?.words[testedWord.value]?.sentences]
})

// NOTE short custom lists do not have a paragraph, meaning they start from 'LIST_NOT_STARTED' rather than 'TESTING_WORD_ONLY'
const testingWordOnly = computed(
  () => props.list.status === 'TESTING_WORD_ONLY' || props.list.status === 'LIST_NOT_STARTED'
)
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
  useTextToSpeechCreationAndStorage(testedWordAudioText.value, 'female', 1)
}

const showRecorderButton = computed(
  () =>
    storeWord.value?.attemptsSuccessful < attemptsSuccessfulRequired.value &&
    storeWord.value?.attempts !== attemptsLimit.value &&
    listEntered.value
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
    return (temporaryTranscript.value = transcript.split(' ').slice(-6).join(' '))

  temporaryTranscript.value = transcript.split(' ').slice(-1).join(' ')

  const transcribedWordCode = usePhoneticConverter(temporaryTranscript.value)
  const testedWordPhoneticCode = usePhoneticConverter(testedWord.value)
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
  // NOTE moves a List Card without a paragraph into the 'In Progress' accordion group
  if (props.list.status === 'LIST_NOT_STARTED') store.setListStatus('TESTING_WORD_ONLY')

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
    // introductionNeeded.value = false
  }

  store.updateListsInFirestore()
}

// const introductionNeeded = ref(true)

const handleCorrectPronunciation = async () => {
  // // NOTE triggers css change
  // highlightActive.value = true
  // // console.log(highlightActive.value)
  // setTimeout(() => {
  //   highlightActive.value = false
  //   // console.log(highlightActive.value)
  // }, 1500)

  if (storeWord.value.attemptsSuccessful === attemptsSuccessfulRequired.value - 1) {
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
    // introductionNeeded.value = true
  } else {
    // NOTE when user answers correctly once, give them a couple more attempts
    store.softResetAttempts(testedWord.value)
    store.logPronunciationAttemptSuccessful(testedWord.value)
    store.logPronunciationAttempt(testedWord.value)
    console.log(testedWord.value)
    // introductionNeeded.value = false
    // if (testingSentences.value) {
    //   checkmarkActive.value = true
    //   setTimeout(() => {
    //     checkmarkActive.value = false
    //   }, 2000)
    // }
  }
}

const skipWord = async () => {
  store.logPronunciationAttempt(testedWord.value)
  useHardWordLogger(testedWord.value)

  await useDelay(2000)

  testedWords.value = testedWords.value.slice(1)
  if (testedWords.value.length > 0) store.setListStatus('TESTING_WORD_ONLY')
  else store.setListStatus('LIST_COMPLETE')

  clearTempAndFinalTranscripts()
  // introductionNeeded.value = false
}

const recordingStatus = computed(() => {
  if (isRecording.value) return 'IS_CURRENTLY_RECORDING'
  if (!finalTranscriptWords.value.length) return 'NOTHING_RECORDED'

  const { attempts, attemptsSuccessful } = storeWord.value

  if (isPronouncedCorrectly.value && attemptsSuccessful === attemptsSuccessfulRequired.value - 1)
    return 'PRONOUNCED_CORRECTLY_ONCE'
  if (isPronouncedCorrectly.value && attemptsSuccessful === attemptsSuccessfulRequired.value)
    return 'PRONOUNCED_CORRECTLY_TWICE'
  if (attempts >= attemptsLimit.value && attemptsSuccessful < attemptsSuccessfulRequired.value)
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
ion-page {
  --height: 100%;
}

.outer-container {
  background-color: #d4efed;
}

.challenge-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 1008px;

  /* min margin for left tab */
  @media (min-width: 768px) and (max-width: 1234px) {
    margin-left: 112px;
  }
}

main {
  background-color: #b9e5e1;
}

.instructions {
  height: 19px;
}

.instructions,
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
  max-height: 15rem;

  @media screen and (min-width: 481px) {
    max-height: 20rem;
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

body.dark {
  .outer-container {
    // background: rgb(29, 29, 29);
    background: rgb(32, 32, 32);
  }

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
