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
      <div v-if="recordingStatus === 'IS_CURRENTLY_RECORDING'"></div>
      <div v-else-if="recordingStatus === 'NO_WORDS_RECORDED'" class="message__text">
        <span>Let's start by testing your pronunciation.</span>
        <span>Hold the button and read the paragraph.</span>
      </div>
      <div v-else-if="recordingStatus === 'FEW_WORD_RECORDED'" class="message__text">
        <span>You didn't record enough words. Please try again.</span>
        <span>Remember to hold the button while recording!</span>
      </div>
      <div v-else-if="recordingStatus === 'ALL_WORDS_CORRECT'" class="message__text">
        <span>You pronounced each tested word correctly. Very impressive!</span>
        <span>Let's test your pronunciation of other words that are commonly mispronounced.</span>
      </div>
      <div v-else-if="recordingStatus === 'ONE_WORD_CORRECT'" class="message__text">
        <span>You pronounced only one word incorrectly. Good job!</span>
        <span>Next, let's practice pronouncing this word.</span>
      </div>
      <div v-else-if="recordingStatus === 'MOST_WORDS_CORRECT'" class="message__text">
        <span
          >You did pretty well! However, these highlighted words were not pronounced
          correctly.</span
        >
        <span>Next, let's practice pronouncing these words.</span>
      </div>
      <div v-else-if="recordingStatus === 'MOST_WORDS_INCORRECT'" class="message__text">
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
    <!-- <RouterLink to="/provided-lists/word-test">Next</RouterLink> -->

    <RecorderButton
      @recording-started="isRecording = true"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :challenge-status="props.list.status"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onActivated, onMounted } from 'vue'
import type { CustomWord, ProvidedWord, Words } from '@/stores/modules/types/List'
import RecorderButton from './RecorderButton.vue'

import useAdjustTestedWords from '@/composables/useAdjustTestedWords'
import useFilterCorrectAndIncorrectWords from '@/composables/useFilterCorrectAndIncorrectWords'

import { useRoute } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useCustomListsStore } from '@/stores/index.ts'

const route = useRoute()
const store = route.name === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

const props = defineProps({
  list: { type: Object, required: true }
  // paragraph: { type: String, required: true },
  // words: { type: Array, required: true }
  // recorderComponentKey: { type: String, required: true }
})

const isRecording = ref(false)
const testedParagraph = ref('')
const testedWordsObj =
  route.name === 'provided-lists' ? ref<Words<ProvidedWord>>({}) : ref<Words<CustomWord>>({})
const testedWords = ref<string[]>([])

const correctlyPronouncedTestedWords = ref<string[]>([])
const mispronouncedTestedWords = ref<string[]>([])

onMounted(() => {
  testedParagraph.value = props.list.paragraph
  testedWords.value = [...Object.keys(props.list.words)]
  testedWordsObj.value = { ...props.list.words }

  // NOTE restore the words if recording has ended & page is reloaded
  if (props.list.status === 'PARAGRAPH_RECORDING_ENDED') {
    correctlyPronouncedTestedWords.value = Object.keys(testedWordsObj.value).filter((word) => {
      return (
        testedWordsObj.value[word].attempts === 1 &&
        testedWordsObj.value[word].attemptsSuccessful === 1
      )
    })

    mispronouncedTestedWords.value = Object.keys(testedWordsObj.value).filter((word) => {
      return (
        testedWordsObj.value[word].attempts === 1 &&
        testedWordsObj.value[word].attemptsSuccessful === 0
      )
    })
  }
})

// onActivated(() => (finalTranscript.value = ''))

const temporaryTranscript = ref('')

const handleTempTranscriptRender = (transcript: string) => {
  temporaryTranscript.value = transcript
}

const temporaryTranscriptDisplay = computed(() =>
  temporaryTranscript.value?.split(' ').slice(-8).join(' ')
)

const finalTranscript = ref('')

const handleFinalTranscript = (transcript: string) => {
  isRecording.value = false
  // TODO test if recording -> stopping -> recording works. Check finalTranscript value in Vue Devtools
  finalTranscript.value = `${finalTranscript.value} ${transcript}`.trim()

  if (finalTranscript.value.split(' ').length <= 10) return

  console.log(`para challenge: ${transcript}`)
  // NOTE chatGPT sometimes modifies tested words that we feed it for creating paragraphs. To prevent bugs, we use this function to change any tested word to its modified version in the paragraph.
  // testedWords.value = useAdjustTestedWords(testedWords.value, testedParagraph.value)
  testedWords.value = useAdjustTestedWords(testedWordsObj.value, testedParagraph.value, route.name)

  const { correctWords, incorrectWords } = useFilterCorrectAndIncorrectWords(
    testedWords.value,
    finalTranscript.value,
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

  store.setParagraph(testedParagraph.value)
  store.setListStatus('PARAGRAPH_RECORDING_ENDED')
  store.updateListsInFirestore()
}

const highlightCorrectAndIncorrectWords = (
  paragraph: string,
  correctWords: string[],
  incorrectWords: string[]
) => {
  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g

  // Splits the paragraph into an array of words and punctuation marks
  const paragraphWords = paragraph.match(wordRegex)

  // @ts-ignore
  const lowercaseParagraphWords = paragraphWords.map((word) => word.toLowerCase())

  // NOTE keeps track of words that have already been marked as incorrect and correct, so that only the first instance of the word is highlighted
  const highlightedIncorrectWords = new Set()
  const highlightedCorrectWords = new Set()

  const highlightedWords = lowercaseParagraphWords.map((word, index) => {
    // @ts-ignore
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

  const highlightedParagraph = highlightedWords.join(' ')

  return fixPunctuation(highlightedParagraph)
}

const fixPunctuation = (paragraph: string) => {
  const replacements = [
    { from: ' .', to: '.' },
    { from: ' , ', to: ', ' },
    { from: ' ; ', to: '; ' },
    { from: ' : ', to: ': ' },
    { from: ' !', to: '!' },
    { from: " ' ", to: "' " },
    { from: "' ", to: "'" },
    { from: '" ', to: '"' },
    { from: /"([^"]*)"/g, to: '"$1" ' }
  ]

  for (const { from, to } of replacements) {
    // @ts-ignore
    paragraph = paragraph.replaceAll(from, to)
  }
  return paragraph
}

const recordingStatus = computed(() => {
  if (isRecording.value) return 'IS_CURRENTLY_RECORDING'
  // NOTE list status is needed b/c finalTranscript is not stored in backend;
  // allows for correct message upon reloading page
  else if (!finalTranscript.value.length && props.list.status === 'LIST_NOT_STARTED')
    return 'NO_WORDS_RECORDED'
  else if (
    finalTranscript.value.split(' ').length <= 10 &&
    props.list.status === 'LIST_NOT_STARTED'
  )
    return 'FEW_WORD_RECORDED'
  else if (correctlyPronouncedTestedWords.value.length === testedWords.value.length)
    return 'ALL_WORDS_CORRECT'
  else if (correctlyPronouncedTestedWords.value.length === testedWords.value.length - 1)
    return 'ONE_WORD_CORRECT'
  else if (correctlyPronouncedTestedWords.value.length > testedWords.value.length * 0.5)
    return 'MOST_WORDS_CORRECT'
  else return 'MOST_WORDS_INCORRECT'
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
