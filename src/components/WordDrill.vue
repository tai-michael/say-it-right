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

    <!-- <TransitionFade v-else>
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
        <div v-else-if="props.list.status === 'LIST_COMPLETED'" class="message__text">
          <span>You've completed the list. Well done!</span
          ><span>
            Challenge yourself with another <RouterLink to="/provided-lists">list</RouterLink> or
            <RouterLink to="/review">Review</RouterLink> the words you've just learned!
          </span>
        </div>
      </div>
    </TransitionFade> -->

    <!-- <RecorderButton
      v-if="showRecorderButton"
      @recording-started="handleRecordingStarted"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :challenge-status="props.list.status"
    /> -->

    <RecorderButton
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
import { computed, onMounted, ref, toRefs } from 'vue'
import type { PropType } from 'vue'
import type { WordObject } from '@/stores/modules/types/Review'
import RecorderButton from './RecorderButton.vue'
import PlayAudioIcon from '@/assets/icons/play-audio.vue'
import TransitionFade from '@/components/transitions/TransitionFade.vue'
import { metaphone } from 'metaphone'
import useTextToSpeechConverter from '@/composables/useTextToSpeechConverter.ts'

const props = defineProps({
  word: { type: Object as PropType<WordObject>, required: true }
})

const { word } = toRefs(props)

const isRecording = ref(false)
const temporaryTranscript = ref('')
const finalTranscriptWords = ref<string[]>([])

const wordName = computed(() => word.value.word)

const testedWordAudioText = computed(
  () => `${wordName.value.slice(0, 1).toUpperCase() + wordName.value.slice(1)}.`
  // NOTE with how Eleven Labs works, adding '!' and making the word
  // all caps makes it louder
  // `${testedWordName.value.toUpperCase()}!`
)

const play = () => {
  useTextToSpeechConverter(testedWordAudioText.value, 'female', 1)
}

const handleRecordingStarted = () => {
  isRecording.value = true
  // NOTE clears the temporary and final transcripts of any residual transcripts
  clearTempAndFinalTranscripts()
}

const clearTempAndFinalTranscripts = () => {
  temporaryTranscript.value = ''
  finalTranscriptWords.value = []
}

const handleFinalTranscript = async (transcript: string) => {
  isRecording.value = false
  if (!transcript) return
  console.log(transcript)

  // if (!transcript || store.activeList?.listNumber !== props.list.listNumber) return
  // console.log(transcript)

  // if (testingWordOnly.value)
  //   isPronouncedCorrectly.value = checkPronunciationOfWordByItself(transcript)
  // else isPronouncedCorrectly.value = checkPronunciationOfWordInSentences(transcript)

  // console.log(isPronouncedCorrectly.value)

  // if (isPronouncedCorrectly.value) {
  //   await handleCorrectPronunciation()
  // } else if (storeWordName.value.attempts === attemptsLimit.value - 1) {
  //   await skipWord()
  // } else {
  //   store.logPronunciationAttempt(testedWordName.value)
  //   introductionNeeded.value = false
  // }

  // store.updateListsInFirestore()
}

// TODO add these two statuses to the WordObject
const testingWordOnly = computed(() => word.value.status === 'TESTING_WORD_ONLY')
const testingSentences = computed(() => word.value.status === 'TESTING_SENTENCES')

const testedSentence = computed(() => {
  return word.value.sentences[0]
})

// const testedSentence = computed(() => {
//   if (sentences.value)
//     return storeWord?.value?.attemptsSuccessful === attemptsSuccessfulRequired.value - 2
//       ? sentences?.value[0]
//       : sentences?.value[1]
//   else return ''
// })

const handleTempTranscriptRender = (transcript: string) => {
  // console.log(transcript)

  // NOTE simply 'return' if I decide not to show transcript for Sentence Challenges
  if (testingSentences.value)
    return (temporaryTranscript.value = transcript.split(' ').slice(-8).join(' '))

  temporaryTranscript.value = transcript.split(' ').slice(-1).join(' ')

  const transcribedWordCode = getPhoneticCode(temporaryTranscript.value)
  const testedWordPhoneticCode = getPhoneticCode(wordName.value)
  if (transcribedWordCode === testedWordPhoneticCode) temporaryTranscript.value = wordName.value

  // // console.log(transcript)
  // // NOTE this guard is necessary b/c the recorder cannot be deactivated between views
  // if (store.activeList?.listNumber !== props.list.listNumber) return

  // // NOTE simply 'return' if I decide not to show transcript for Sentence Challenges
  // if (testingSentences.value)
  //   return (temporaryTranscript.value = transcript.split(' ').slice(-8).join(' '))

  // temporaryTranscript.value = transcript.split(' ').slice(-1).join(' ')

  // const transcribedWordCode = getPhoneticCode(temporaryTranscript.value)
  // const testedWordPhoneticCode = getPhoneticCode(testedWordName.value)
  // if (transcribedWordCode === testedWordPhoneticCode) temporaryTranscript.value = testedWordName.value
}

// NOTE convert any mistranscribed word to the tested word if they sound the same
const getPhoneticCode = (word: string) => {
  return metaphone(word)
}

onMounted(() => {
  console.log(wordName.value)
})
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  // min-height: 700px;
  min-width: 300px;
}
.word-and-sentences {
  min-height: 140px;
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
    // Note that transition is applied here rather than in word-highlight
    transition: color 0.2s ease-in-out;
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
