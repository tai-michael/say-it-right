import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import commonlyMispronouncedWords from '@/assets/commonly-mispronounced-words.json'

export const useSuggestedListStore = defineStore('suggested', () => {
  // const temporaryTranscript = ref('')
  // const finalTranscript = ref('')

  const paragraphTestCompleted = ref(false)
  const wordTestCompleted = ref(false)
  const sentenceTestCompleted = ref(false)

  const mispronouncedTestedWords = ref([])

  // NOTE clickable word lists that will appear in UI, maybe as the 3rd or 1st tab
  const allLists = ref([...commonlyMispronouncedWords])

  const partiallyTestedLists = computed(() =>
    allLists.value.filter((list) => list.testingStarted === true && list.testingCompleted === false)
  )

  const untestedLists = computed(() =>
    allLists.value.filter(
      (list) => list.testingStarted === false && list.testingCompleted === false
    )
  )

  const completedLists = computed(() =>
    allLists.value.filter((list) => list.testingStarted === true && list.testingCompleted === true)
  )

  return {
    partiallyTestedLists,
    untestedLists,
    completedLists,
    allLists,
    paragraphTestCompleted,
    wordTestCompleted,
    sentenceTestCompleted,
    mispronouncedTestedWords
  }
})
