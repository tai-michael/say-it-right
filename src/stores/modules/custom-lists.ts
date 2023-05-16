import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { db } from '@/firebaseInit'
import {
  doc,
  updateDoc
  // setDoc
  // arrayUnion,
} from 'firebase/firestore'
import { user } from '@/firebaseInit'
import type { List, ListStatus } from './types/List'
import useSpanTagsRemover from '@/composables/useSpanTagsRemover'

export const useCustomListsStore = defineStore('customLists', () => {
  const route = useRoute()

  // NOTE the '+' is necessary b/c the number becomes a string when sent as a parameter
  const activeList = computed<List | undefined>(() =>
    allLists.value.find((list) => list.listNumber === +route.params.id)
  )

  const activeId: Ref<number | null> = ref(null)

  const allLists = ref<List[]>([])

  const inProgressLists = computed(() =>
    allLists.value.filter(
      (list) =>
        list.status === 'PARAGRAPH_RECORDING_ENDED' ||
        list.status === 'TESTING_WORD_ONLY' ||
        list.status === 'TESTING_SENTENCES'
    )
  )

  const untouchedLists = computed(() =>
    allLists.value.filter((list) => list.status === 'LIST_NOT_STARTED')
  )

  const completedLists = computed(() =>
    allLists.value.filter((list) => list.status === 'LIST_COMPLETE')
  )

  const setActiveId = (id: number | null): void => {
    activeId.value = id
  }

  const setListStatus = (status: ListStatus) => {
    if (activeList.value) activeList.value.status = status
  }

  const setLists = (lists: List[]) => {
    allLists.value = lists
  }

  const updateListsInFirestore = async () => {
    if (user.value)
      await updateDoc(doc(db, 'users', user.value.uid), {
        customLists: allLists.value
      })
    // sessionStorage.setItem('allProvidedLists', JSON.stringify(allLists.value))
    console.log('Updated firestore customList')
  }

  const logPronunciationAttempt = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord) matchedWord.attempts++
    console.log(`logged attempt for ${testedWord}. Total attempts: ${matchedWord?.attempts}`)
  }

  const logPronunciationAttemptSuccessful = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord) matchedWord.attemptsSuccessful++
    console.log(
      `logged successful attempt for ${testedWord}. Total successful attempts: ${matchedWord?.attemptsSuccessful}`
    )
  }

  const attemptsSuccessfulRequired = computed(() =>
    activeList.value?.status === 'TESTING_WORD_ONLY' ? 2 : 4
  )

  const attemptsLimit = computed(() => attemptsSuccessfulRequired.value + 4)

  const softResetAttempts = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord && matchedWord.attempts >= 4) {
      matchedWord.attempts -= 2
      console.log(`reset attempt for ${testedWord}. Total attempts: ${matchedWord?.attempts}`)
    }
  }

  const hardResetAttempts = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    // NOTE 1 is the initial value for all words that have been tested in the ParagraphChallenge
    if (matchedWord) matchedWord.attempts = 3
  }

  // NOTE when user reviews a completed list, simply replace the entire list with its counterpart in the json file, as word attempts would need to be reset too. This also means weak words should definitely be copies rather than references, as references would get reset meaning they'd disappear from the weak/passed words lists
  const setParagraph = (paragraph: string) => {
    if (activeList.value) activeList.value.paragraph = paragraph
  }

  const setTestedWordsObj = (wordsObj: object) => {
    if (activeList.value) activeList.value.words = { ...wordsObj }
  }

  const resetWords = () => {
    if (activeList.value) {
      const words = activeList.value.words
      Object.keys(words).forEach((word) => {
        words[word].attempts = 0
        words[word].attemptsSuccessful = 0
      })
    }
  }

  const resetParagraph = () => {
    if (activeList.value)
      activeList.value.paragraph = useSpanTagsRemover(activeList.value.paragraph)
  }

  const resetList = () => {
    resetWords()
    resetParagraph()
    setListStatus('LIST_NOT_STARTED')
    updateListsInFirestore()
  }

  // const setFinalParagraphTranscript = (transcript) => {
  //   activeList.value.finalParagraphTranscript = transcript
  //   console.log(activeList.value.finalParagraphTranscript)
  // }

  return {
    activeList,
    activeId,
    allLists,
    inProgressLists,
    untouchedLists,
    completedLists,
    attemptsLimit,
    attemptsSuccessfulRequired,

    setActiveId,
    setListStatus,
    setLists,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful,
    softResetAttempts,
    hardResetAttempts,
    updateListsInFirestore,
    setParagraph,
    setTestedWordsObj,
    resetList
    // setFinalParagraphTranscript,
  }
})
