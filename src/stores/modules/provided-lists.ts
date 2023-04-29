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

export const useProvidedListsStore = defineStore('providedLists', () => {
  const route = useRoute()

  // NOTE the '+' is necessary b/c the number becomes a string when sent as a parameter
  const activeList = computed(() =>
    allLists.value.find((list) => list.listNumber === +route.params.id)
  )

  const activeId: Ref<number | null> = ref(null)

  const allLists =
    // ref([...JSON.parse(sessionStorage.getItem('allProvidedLists'))]) ||
    // ref([...firestoreLists.value])
    ref<List[]>([])

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

  const setActiveId = (id: number) => {
    activeId.value = id
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
        providedLists: allLists.value
      })
    // sessionStorage.setItem('allProvidedLists', JSON.stringify(allLists.value))
    console.log('Updated firestore providedList')
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

  const attemptsLimit = 6

  const softResetAttempts = (testedWord: string) => {
    const matchedWord = activeList.value?.words[testedWord]
    if (matchedWord && matchedWord.attempts >= attemptsLimit - 2) {
      matchedWord.attempts -= 2
      console.log(`reset attempt for ${testedWord}. Total attempts: ${matchedWord?.attempts}`)
    }
  }

  // NOTE when user reviews a completed list, simply replace the entire list with its counterpart in the json file, as word attempts would need to be reset too. This also means weak words should definitely be copies rather than references, as references would get reset meaning they'd disappear from the weak/passed words lists
  const setParagraph = (paragraph: string) => {
    if (activeList.value) activeList.value.paragraph = paragraph
  }

  const setTestedWordsObj = (wordsObj: object) => {
    if (activeList.value) activeList.value.words = { ...wordsObj }
  }

  // const setFinalParagraphTranscript = (transcript) => {
  //   activeList.value.finalParagraphTranscript = transcript
  //   console.log(activeList.value.finalParagraphTranscript)
  // }

  const downloadAndExtractGlobalProvidedLists = async () => {
    const querySnapshot = await getDocs(collection(db, 'global_provided_lists'))
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

    setActiveId,
    setListStatus,
    setLists,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful,
    softResetAttempts,
    updateListsInFirestore,
    setParagraph,
    setTestedWordsObj,
    downloadAndExtractGlobalProvidedLists
    // setFinalParagraphTranscript,
  }
})
