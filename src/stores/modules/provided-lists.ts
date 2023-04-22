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
// import commonlyMispronouncedWords from '@/assets/commonly-mispronounced-words.json'
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

  return {
    activeList,
    activeId,
    allLists,
    inProgressLists,
    untouchedLists,
    completedLists,
    firestoreLists,

    setActiveId,
    setListStatus,
    logPronunciationAttempt,
    logPronunciationAttemptSuccessful,
    updateListsInFirestore,
    setParagraph,
    setTestedWordsObj
    // setFinalParagraphTranscript,
  }
})
