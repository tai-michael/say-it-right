import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import commonlyMispronouncedWords from '@/assets/commonly-mispronounced-words.json'

export const usePersonalListStore = defineStore('personal', () => {
  const route = useRoute()

  const activeList = computed(() =>
    allLists.value.find((list) => list.listNumber === +route.params.id)
  )

  const allLists = ref([...commonlyMispronouncedWords])

  const partiallyTestedLists = computed(() =>
    allLists.value.filter((list) => list.testingStarted === true && list.testingCompleted === false)
  )

  const untestedLists = computed(() =>
    allLists.value.filter(
      (list) => list.testingStarted === false && list.testingCompleted === false
    )
  )

  const completelyTestedLists = computed(() =>
    allLists.value.filter((list) => list.testingStarted === true && list.testingCompleted === true)
  )

  const paragraphTestCompleted = ref(false)
  const wordTestCompleted = ref(false)
  const sentenceTestCompleted = ref(false)

  const mispronouncedTestedWords = ref([])

  const logPronunciationAttempt = (testedWord) => {
    const matchedWord = activeList.value.words[testedWord]
    if (matchedWord) matchedWord.attempts++
  }

  const logPronunciationAttemptSuccessful = (testedWord) => {
    const matchedWord = activeList.value.words[testedWord]
    if (matchedWord) matchedWord.attemptsSuccessful++
  }

  // const logPronunciationAttempt = (testedWord) => {
  //   for (const list of allLists.value) {
  //     const wordObj = list.words.find((word) => word === testedWord)
  //     if (wordObj) wordObj.attempts++
  //   }
  // }

  return {
    activeList,
    allLists,
    partiallyTestedLists,
    untestedLists,
    completelyTestedLists,

    paragraphTestCompleted,
    wordTestCompleted,
    sentenceTestCompleted,
    mispronouncedTestedWords,

    logPronunciationAttempt,
    logPronunciationAttemptSuccessful
  }
})
