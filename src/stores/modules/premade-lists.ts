import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { db } from '@/firebaseInit'
import {
  collection,
  doc,
  getDocs,
  updateDoc
  // setDoc
  // arrayUnion,
} from 'firebase/firestore'
import { user } from '@/firebaseInit'
import type { List, ListStatus } from './types/List'
import useSpanTagsRemover from '@/composables/useSpanTagsRemover'

export const usePremadeListsStore = defineStore('premadeLists', () => {
  const route = useRoute()

  // NOTE the '+' is necessary b/c the number becomes a string when sent as a parameter
  const activeList = computed(() =>
    allLists.value.find((list) => list.listNumber === +route.params.id)
  )

  const activeId: Ref<number | null> = ref(null)

  const allLists =
    // ref([...JSON.parse(sessionStorage.getItem('allPremadeLists'))]) ||
    // ref([...firestoreLists.value])
    ref<List[]>([])

  const firestoreLists = ref([])

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

  const setActiveId = (id: number | null) => {
    activeId.value = id
    // console.log(`id set to ${activeId.value}`)
  }

  const setListStatus = (status: ListStatus) => {
    if (activeList.value) activeList.value.status = status
  }

  const setLists = (lists: List[]) => {
    allLists.value = lists
  }

  const updateListsInFirestore = () => {
    if (user.value)
      updateDoc(doc(db, 'users', user.value.uid), {
        premadeLists: allLists.value
      })
    // sessionStorage.setItem('allPremadeLists', JSON.stringify(allLists.value))
    console.log('Updated firestore premadeList')
  }

  const logPronunciationAttempt = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord) matchedWord.attempts++
    console.log(`logged attempt for ${testedWord}. Total attempts: ${matchedWord?.attempts}`)
    // console.log('logged 1 attempt')
  }

  const logPronunciationAttemptSuccessful = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord) matchedWord.attemptsSuccessful++
    console.log(
      `logged successful attempt for ${testedWord}. Total successful attempts: ${matchedWord?.attemptsSuccessful}`
    )
  }
  // const logPronunciationAttempt = (testedWord) => {
  //   for (const list of allLists.value) {
  //     const wordObj = list.words.find((word) => word === testedWord)
  //     if (wordObj) wordObj.attempts++
  //   }
  // }

  const attemptsSuccessfulRequired = computed(() =>
    activeList.value?.status === 'TESTING_WORD_ONLY' ? 2 : 4
  )

  const attemptsLimit = computed(() => attemptsSuccessfulRequired.value + 4)

  const softResetAttempts = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord && matchedWord.attempts >= attemptsLimit.value - 2) {
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
    console.log('reset list clicked')
    resetWords()
    resetParagraph()
    setListStatus('LIST_NOT_STARTED')
    updateListsInFirestore()
    console.log('list reset')
  }

  const deleteList = (listNum: number) => {
    const index = allLists.value.findIndex((list) => list.listNumber === listNum)
    allLists.value.splice(index, 1)
  }

  const downloadAndExtractGlobalPremadeLists = async () => {
    const querySnapshot = await getDocs(collection(db, 'global_premade_lists'))
    const lists = querySnapshot.docs.map((doc) => doc.data())

    const wordsByListNumber = {}

    lists.forEach((list) => {
      const { listNumber, words, paragraph } = list

      const wordsObject = {}

      Object.keys(words).forEach((word) => {
        // @ts-ignore
        wordsObject[word] = {
          ...words[word],
          attempts: 0,
          attemptsSuccessful: 0
        }
      })

      // @ts-ignore
      wordsByListNumber[listNumber] = {
        listNumber,
        words: wordsObject,
        status: 'LIST_NOT_STARTED',
        attempts: 0,
        attemptsSuccessful: 0,
        paragraph: paragraph || ''
      }
    })

    // @ts-ignore
    const result = []

    Object.keys(wordsByListNumber)
      // @ts-ignore
      .sort((a, b) => a - b)
      .forEach((listNumber) => {
        // @ts-ignore
        result.push(wordsByListNumber[listNumber])
      })

    // @ts-ignore
    console.log(result)
    // @ts-ignore
    return result
  }

  return {
    activeList,
    activeId,
    allLists,
    inProgressLists,
    untouchedLists,
    completedLists,
    firestoreLists,
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
    resetList,
    deleteList,
    downloadAndExtractGlobalPremadeLists
    // setFinalParagraphTranscript,
  }
})
