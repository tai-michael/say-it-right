import { computed, ref } from 'vue'
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

export const useProvidedListsStore = defineStore('providedLists', () => {
  const route = useRoute()

  // NOTE the '+' is necessary b/c the number becomes a string when sent as a parameter
  const activeList = computed(() =>
    allLists.value.find((list) => list.listNumber === +route.params.id)
  )

  const activeId = ref(null)

  const firestoreLists = ref([])

  const allLists =
    // ref([...JSON.parse(sessionStorage.getItem('allProvidedLists'))]) ||
    // ref([...firestoreLists.value])
    ref([])

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

  const setActiveId = (id) => {
    activeId.value = id
  }

  const setListStatus = (status) => {
    activeList.value.status = status
  }

  const updateListsInFirestore = () => {
    updateDoc(doc(db, 'users', user.value.uid), {
      providedLists: allLists.value
    })
    // sessionStorage.setItem('allProvidedLists', JSON.stringify(allLists.value))
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

  // NOTE when user reviews a completed list, simply replace the entire list with its counterpart in the json file, as word attempts would need to be reset too. This also means weak words should definitely be copies rather than references, as references would get reset meaning they'd disappear from the weak/passed words lists
  const setParagraph = (paragraph) => {
    activeList.value.paragraph = paragraph
  }

  const setTestedWordsObj = (wordsObj) => {
    activeList.value.words = { ...wordsObj }
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
