import { computed, ref } from 'vue'
// import type { Ref } from 'vue'
import { defineStore } from 'pinia'
// import { useRoute } from 'vue-router'
import { db } from '@/firebaseInit'
import {
  // collection,
  doc,
  // getDocs,
  updateDoc
  // setDoc
  // arrayUnion,
} from 'firebase/firestore'
import { user } from '@/firebaseInit'
import type { WordObject, WordStatus } from './types/Review'

export const useReviewStore = defineStore('review', () => {
  // const route = useRoute()

  const allWords = ref<WordObject[]>([])

  const addWords = (array: WordObject[]) => {
    allWords.value.push(...array)
  }

  const setWords = (array: WordObject[]) => {
    allWords.value = array
  }

  const setWordStatus = (word: WordObject, status: WordStatus) => {
    word.status = status
  }

  const updateReviewInFirestore = () => {
    if (user.value)
      updateDoc(doc(db, 'users', user.value.uid), {
        review: allWords.value
      })
    // sessionStorage.setItem('allProvidedLists', JSON.stringify(allLists.value))
    console.log('Updated firestore review')
  }

  // TODO should maybe make 3 categories or simply a dropdown filter for:
  // Not reviewed / Need review, Recently reviewed, Mastered/Proficient (maybe; consider UX)
  const inProgressWords = computed(() => allWords.value.filter((word) => word.attempts > 0))

  const untouchedWords = computed(() => allWords.value.filter((word) => word.attempts === 0))

  const masteredWords = computed(() => allWords.value.filter((word) => word.attempts === 0))

  // const setActiveId = (id: number) => {
  //   activeId.value = id
  // }

  // const setListStatus = (status: ListStatus) => {
  //   if (activeList.value) activeList.value.status = status
  // }

  // const setLists = (lists: List[]) => {
  //   allLists.value = lists
  // }

  const logPronunciationAttempt = (testedWord: string) => {
    const matchedWord = allWords.value.find((word) => word.word === testedWord)
    if (matchedWord) matchedWord.attempts++
    console.log(`logged attempt for ${testedWord}. Total attempts: ${matchedWord?.attempts}`)
  }

  const logPronunciationAttemptSuccessful = (testedWord: string) => {
    const matchedWord = allWords.value.find((word) => word.word === testedWord)
    if (matchedWord) matchedWord.attemptsSuccessful++
    console.log(
      `logged successful attempt for ${testedWord}. Total successful attempts: ${matchedWord?.attemptsSuccessful}`
    )
  }

  const attemptsLimit = 6

  const softResetAttempts = (testedWord: string) => {
    const matchedWord = allWords.value.find((word) => word.word === testedWord)
    if (matchedWord && matchedWord.attempts >= attemptsLimit - 2) {
      matchedWord.attempts -= 2
      console.log(`reset attempt for ${testedWord}. Total attempts: ${matchedWord?.attempts}`)
    }
  }

  const hardResetAttempts = (testedWord: string) => {
    const matchedWord = allWords.value.find((word) => word.word === testedWord)
    // NOTE 1 is the initial value for all words that have been tested in the ParagraphChallenge
    if (matchedWord) matchedWord.attempts = 3
  }

  // const setTestedWordsObj = (wordsObj: object) => {
  //   if (activeList.value) activeList.value.words = { ...wordsObj }
  // }

  return {
    allWords,
    // activeWord,
    // firestoreWord,
    inProgressWords,
    untouchedWords,
    masteredWords,
    attemptsLimit,

    addWords,
    setWords,
    // setActiveId,
    setWordStatus,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful,
    softResetAttempts,
    hardResetAttempts,
    updateReviewInFirestore
    // setTestedWordsObj
  }
})
