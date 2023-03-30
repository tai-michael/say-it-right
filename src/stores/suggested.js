import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSuggestedListStore = defineStore('suggested', () => {
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

  return {
    paragraphTestCompleted,
    wordTestCompleted,
    sentenceTestCompleted,
    mispronouncedTestedWords
  }
})
