import { ref } from 'vue'
import { defineStore } from 'pinia'
import commonlyMispronouncedWords from '@/assets/commonly-mispronounced-words.json'

export const useSuggestedListStore = defineStore('suggested', () => {
  // const temporaryTranscript = ref('')
  // const finalTranscript = ref('')

  const paragraphTestCompleted = ref(false)
  const wordTestCompleted = ref(false)
  const sentenceTestCompleted = ref(false)

  const mispronouncedTestedWords = ref([])
  // const sentencesTestCompleted = computed(
  //   () => paragraphTestCompleted.value && wordTestCompleted.value
  // )
  // function increment() {
  //   count.value++
  // }

  const allProvidedWords = ref([...commonlyMispronouncedWords])

  return {
    // temporaryTranscript,
    // finalTranscript,
    allProvidedWords,
    paragraphTestCompleted,
    wordTestCompleted,
    sentenceTestCompleted,
    mispronouncedTestedWords
  }
})
