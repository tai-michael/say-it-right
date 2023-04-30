import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
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
import type { List } from './types/List'
import type { WordObject } from './types/Review'

export const useWordReviewStore = defineStore('wordReview', () => {
  const route = useRoute()

  const allWords = ref<WordObject[]>([])

  const addWords = (array: WordObject[]) => {
    allWords.value.push(...array)
  }

  const setWords = (array: WordObject[]) => {
    allWords.value = array
  }

  const updateWordReviewInFirestore = () => {
    if (user.value)
      updateDoc(doc(db, 'users', user.value.uid), {
        wordReview: allWords.value
      })
    // sessionStorage.setItem('allProvidedLists', JSON.stringify(allLists.value))
    console.log('Updated firestore wordReview')
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

  const activeList = ref<List[]>([])

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
    // setWordStatus,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful,
    softResetAttempts,
    updateWordReviewInFirestore
    // setTestedWordsObj
  }
})
