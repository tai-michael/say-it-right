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
        list.testStatus === 'PARAGRAPH_RECORDING_ENDED' ||
        list.testStatus === 'WORD_CHALLENGE_STARTED' ||
        list.testStatus === 'SENTENCE_CHALLENGE_STARTED'
    )
  )

  const untestedLists = computed(() =>
    allLists.value.filter((list) => list.testStatus === 'TEST_NOT_STARTED')
  )

  const completelyTestedLists = computed(() =>
    allLists.value.filter((list) => list.testStatus === 'TEST_COMPLETED')
  )

  // const paragraphChallengeCompleted = ref(false)
  // const wordChallengeCompleted = ref(false)
  // const sentenceChallengeCompleted = ref(false)

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

    // paragraphChallengeCompleted,
    // wordChallengeCompleted,
    // sentenceChallengeCompleted,
    mispronouncedTestedWords,

    setActiveId,
    setTestStatus,
    setNewParagraph,
    setFinalParagraphTranscript,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful
  }
})
