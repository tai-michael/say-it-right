import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'

export const useCustomListsStore = defineStore('customLists', () => {
  const route = useRoute()

  // NOTE the '+' is necessary b/c the number becomes a string when sent as a parameter
  const activeList = computed<List | undefined>(() =>
    allLists.value.find((list) => list.listNumber === +route.params.id)
  )

  const setListStatus = (status: string) => {
    if (activeList.value) activeList.value.status = status
  }

  const activeId: Ref<number | null> = ref(null)
  // const activeId = ref(null)

  interface Word {
    mispronouncedFrequentlyAs: string
    mispronunciationFrequency: number
    mistakeType: string
    essentialSound: string
    pronunciationTip: string
    attempts: number
    attemptsSuccessful: number
  }

  interface List {
    listNumber: number
    status: string
    paragraph: string
    words: {
      [key: string]: Word
    }
  }

  const allLists = ref<Array<List>>([])
  // const allLists = ref([])

  const firestoreLists = ref([])

  const inProgressLists = computed(() =>
    allLists.value.filter(
      (list) =>
        list.status === 'PARAGRAPH_RECORDING_ENDED' ||
        list.status === 'WORD_CHALLENGE_STARTED' ||
        list.status === 'SENTENCE_CHALLENGE_STARTED'
    )
  )

  const untouchedLists = computed(() =>
    allLists.value.filter((list) => list.status === 'LIST_NOT_STARTED')
  )

  const completedLists = computed(() =>
    allLists.value.filter((list) => list.status === 'LIST_COMPLETED')
  )

  // const paragraphChallengeCompleted = ref(false)
  // const wordChallengeCompleted = ref(false)
  // const sentenceChallengeCompleted = ref(false)

  const mispronouncedTestedWords = ref([])

  const setActiveId = (id: number): void => {
    activeId.value = id
  }

  // const setListStatus = (status: string) => {
  //   activeList.value.status = status
  // }

  const setNewParagraph = (paragraph: string) => {
    if (activeList.value) activeList.value.paragraph = paragraph
  }

  // const setFinalParagraphTranscript = (transcript) => {
  //   activeList.value.finalParagraphTranscript = transcript
  //   console.log(activeList.value.finalParagraphTranscript)
  // }

  const logPronunciationAttempt = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord) matchedWord.attempts++
  }

  const logPronunciationAttemptSuccessful = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
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
    inProgressLists,
    untouchedLists,
    completedLists,
    firestoreLists,
    // paragraphChallengeCompleted,
    // wordChallengeCompleted,
    // sentenceChallengeCompleted,
    mispronouncedTestedWords,

    setActiveId,
    setListStatus,
    setNewParagraph,
    // setFinalParagraphTranscript,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful
  }
})
