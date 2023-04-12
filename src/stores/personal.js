import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'

export const usePersonalListStore = defineStore('personal', () => {
  const route = useRoute()

  // NOTE the '+' is necessary b/c the number becomes a string when sent as a parameter
  const activeList = computed(() =>
    allLists.value.find((list) => list.listNumber === +route.params.id)
  )

  const activeId = ref(null)

  const allLists = ref([])

  const partiallyTestedLists = computed(() =>
    allLists.value.filter(
      (list) =>
        list.testStatus === 'paragraph test recording completed' ||
        list.testStatus === 'word test in progress' ||
        list.testStatus === 'sentence test in progress'
    )
  )

  const untestedLists = computed(() =>
    allLists.value.filter((list) => list.testStatus === 'not started')
  )

  const completelyTestedLists = computed(() =>
    allLists.value.filter((list) => list.testStatus === 'completed')
  )

  // const paragraphTestCompleted = ref(false)
  // const wordTestCompleted = ref(false)
  // const sentenceTestCompleted = ref(false)

  const mispronouncedTestedWords = ref([])

  const setActiveId = (id) => {
    activeId.value = id
  }

  const setTestStatus = (status) => {
    activeList.value.testStatus = status
  }

  const setNewParagraph = (paragraph) => {
    activeList.value.paragraph = paragraph
  }

  const setFinalParagraphTranscript = (transcript) => {
    activeList.value.finalParagraphTranscript = transcript
    console.log(activeList.value.finalParagraphTranscript)
  }

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
    activeId,
    allLists,
    partiallyTestedLists,
    untestedLists,
    completelyTestedLists,

    // paragraphTestCompleted,
    // wordTestCompleted,
    // sentenceTestCompleted,
    mispronouncedTestedWords,

    setActiveId,
    setTestStatus,
    setNewParagraph,
    setFinalParagraphTranscript,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful
  }
})
