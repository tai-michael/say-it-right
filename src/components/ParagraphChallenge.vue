<template>
  <main>
    <hr />
    <div class="tested-paragraph">
      <p v-html="testedParagraph"></p>
    </div>
    <hr />

    <div v-if="isRecording" class="transcript-container">
      <label>Live transcript:</label>
      <div>{{ temporaryTranscriptDisplay }}</div>
    </div>

    <div v-else class="message">
      <div v-if="assessment === 'isCurrentlyRecording'"></div>
      <div v-else-if="assessment === 'noWordsRecorded'" class="message__text">
        <span>Let's start by testing your pronunciation.</span>
        <span>Hold the button and read the paragraph.</span>
      </div>
      <div v-else-if="assessment === 'fewWordsRecorded'" class="message__text">
        <span>You didn't record enough words. Please try again.</span>
        <span>Remember to hold the button while recording!</span>
      </div>
      <div v-else-if="assessment === 'allWordsCorrect'" class="message__text">
        <span>You pronounced each tested word correctly. Very impressive!</span>
        <span>Let's test your pronunciation of other words that are commonly mispronounced.</span>
      </div>
      <div v-else-if="assessment === 'oneWordIncorrect'" class="message__text">
        <span>You pronounced only one word incorrectly. Good job!</span>
        <span>Next, let's practice pronouncing this word.</span>
      </div>
      <div v-else-if="assessment === 'mostWordsCorrect'" class="message__text">
        <span
          >You did pretty well! However, these highlighted words were not pronounced
          correctly.</span
        >
        <span>Next, let's practice pronouncing these words.</span>
      </div>
      <div v-else-if="assessment === 'mostWordsIncorrect'" class="message__text">
        <span>These highlighted words were not pronounced correctly.</span>
        <span>Next, let's practice pronouncing these words.</span>
      </div>
    </div>

    <button
      class="next-button"
      v-if="props.list.status === 'PARAGRAPH_RECORDING_ENDED'"
      @click="store.setListStatus('WORD_CHALLENGE_STARTED')"
    >
      Next
    </button>
    <!-- <RouterLink to="/suggested/word-test">Next</RouterLink> -->

    <RecorderButton
      @recording-started="isRecording = true"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :challenge-status="props.list.status"
    />
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import RecorderButton from './RecorderButton.vue'

import useAdjustTestedWords from '@/composables/useAdjustTestedWords'
import useFilterCorrectAndIncorrectWords from '@/composables/useFilterCorrectAndIncorrectWords'

import { useRoute } from 'vue-router'
import { useSuggestedListStore } from '@/stores/suggested'
import { usePersonalListStore } from '@/stores/personal'

const route = useRoute()
const store = route.name === 'suggested' ? useSuggestedListStore() : usePersonalListStore()

const props = defineProps({
  list: { type: Object, required: true }
  // paragraph: { type: String, required: true },
  // words: { type: Array, required: true }
  // recorderComponentKey: { type: String, required: true }
})

let isRecording = ref(false)
const testedParagraph = ref('')
const testedWords = ref([])

onMounted(() => {
  testedParagraph.value = props.list.paragraph
  testedWords.value = [...Object.keys(props.list.words)]
})

const correctlyPronouncedTestedWords = ref([])
const mispronouncedTestedWords = ref([])

// TODO relocate this to WordChallenge
let temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript) => {
  temporaryTranscript.value = transcript
}

const temporaryTranscriptDisplay = computed(() =>
  props.list.status === 'PARAGRAPH_RECORDING_ENDED'
    ? ''
    : temporaryTranscript.value?.split(' ').slice(-8).join(' ')
)

let finalTranscript = ref('')

const handleFinalTranscript = (transcript) => {
  isRecording.value = false
  finalTranscript.value = transcript

  if (transcript.split(' ').length <= 10) return

  // NOTE chatGPT sometimes modifies tested words that we feed it for creating paragraphs. To prevent bugs, we use this function to change any tested word to its modified version in the paragraph.
  testedWords.value = useAdjustTestedWords(testedWords.value, testedParagraph.value)

  const { correctWords, incorrectWords } = useFilterCorrectAndIncorrectWords(
    testedWords.value,
    transcript,
    route.name
  )
  correctlyPronouncedTestedWords.value = correctWords
  mispronouncedTestedWords.value = incorrectWords

  // NOTE highlights mispronounced tested words in red and correctly pronounced words in green; consider not highlighting correct words in the final version.
  testedParagraph.value = highlightCorrectAndIncorrectWords(
    testedParagraph.value,
    correctlyPronouncedTestedWords.value,
    mispronouncedTestedWords.value
  )

  // TODO will need to also send testedParagraph (for this MAYBE do it in the composable) and status to backend
  store.setListStatus('PARAGRAPH_RECORDING_ENDED')
}

const highlightCorrectAndIncorrectWords = (paragraph, correctWords, incorrectWords) => {
  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g

  // Splits the paragraph into an array of words and punctuation marks
  const paragraphWords = paragraph.match(wordRegex)

  const lowercaseParagraphWords = paragraphWords.map((word) => word.toLowerCase())

  // NOTE keeps track of words that have already been marked as incorrect and correct, so that only the first instance of the word is highlighted
  const highlightedIncorrectWords = new Set()
  const highlightedCorrectWords = new Set()

  const highlightedWords = lowercaseParagraphWords.map((word, index) => {
    const originalWord = paragraphWords[index]
    if (incorrectWords.includes(word) && !highlightedIncorrectWords.has(word)) {
      highlightedIncorrectWords.add(word)
      return `<span class="incorrect">${originalWord}</span>`
    } else if (correctWords.includes(word) && !highlightedCorrectWords.has(word)) {
      highlightedCorrectWords.add(word)
      return `<span class="correct">${originalWord}</span>`
    } else {
      return originalWord
    }
  })

  let highlightedParagraph = highlightedWords.join(' ')

  return fixPunctuation(highlightedParagraph)
}

const fixPunctuation = (paragraph) => {
  const replacements = [
    { from: ' .', to: '.' },
    { from: ' , ', to: ', ' },
    { from: ' ; ', to: '; ' },
    { from: ' : ', to: ': ' },
    { from: " ' ", to: "' " },
    { from: "' ", to: "'" },
    { from: '" ', to: '"' },
    { from: /"([^"]*)"/g, to: '"$1" ' }
  ]

  for (const { from, to } of replacements) {
    paragraph = paragraph.replaceAll(from, to)
  }
  return paragraph
}

const assessment = computed(() => {
  if (isRecording.value) return 'isCurrentlyRecording'
  else if (!finalTranscript.value.length) return 'noWordsRecorded'
  else if (finalTranscript.value.split(' ').length <= 10) return 'fewWordsRecorded'
  else if (correctlyPronouncedTestedWords.value.length === testedWords.value.length)
    return 'allWordsCorrect'
  else if (correctlyPronouncedTestedWords.value.length === testedWords.value.length - 1)
    return 'oneWordIncorrect'
  else if (correctlyPronouncedTestedWords.value.length > testedWords.value.length * 0.5)
    return 'mostWordsCorrect'
  else return 'mostWordsIncorrect'
})
</script>

<style lang="scss" scoped>
@media (min-width: 1024px) {
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    // align-items: center;
  }
}

label {
  font-weight: 800;
}

.tested-paragraph {
  margin: 1rem 0;
  // 'deep' selector is necessary, as scoped styles don't apply to content inside v-html
  &:deep(.incorrect),
  &:deep(.correct) {
    color: white;
  }

  &:deep(.incorrect) {
    // The fourth 0 sets the highlight to fully transparent. Using rgba, which allows the setting of transparency, keeps the text fully visible.
    background-color: rgba(255, 0, 0, 0);
    // the forwards tested word keeps the final animation state
    animation: fadeInRed 0.5s ease-in-out forwards;
  }

  &:deep(.correct) {
    background-color: rgba(0, 128, 0, 0);
    animation: fadeInGreen 0.5s ease-in-out forwards;
  }

  @keyframes fadeInRed {
    0% {
      background-color: rgba(255, 0, 0, 0);
    }
    100% {
      background-color: rgba(255, 0, 0, 1);
    }
  }

  @keyframes fadeInGreen {
    0% {
      background-color: rgba(0, 128, 0, 0);
    }
    100% {
      background-color: rgba(0, 128, 0, 1);
    }
  }
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
}

.next-button {
  max-width: 50px;
}
</style>
