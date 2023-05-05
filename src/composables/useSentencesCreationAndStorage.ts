import useOpenAiSentencesGenerator from '@/composables/useOpenAiSentencesGenerator'
useWordObjCreator
import useWordObjCreator from '@/composables/useWordObjCreator'
import useCheckIfWordsExistInWordReview from '@/composables/useCheckIfWordsExistInWordReview'
import type { Sentences } from '@/stores/modules/types/Sentences'
import type { WordObject } from '@/stores/modules/types/Review'
import type { List } from '@/stores/modules/types/List'
import { db } from '@/firebaseInit'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  collection,
  where,
  documentId,
  getDocs
} from 'firebase/firestore'
import { useCustomListsStore, useProvidedListsStore, useWordReviewStore } from '@/stores/index.ts'

export default async function (words: string[], listNum: number) {
  const wordReviewStore = useWordReviewStore()
  const customListsStore = useCustomListsStore()
  const providedListsStore = useProvidedListsStore()

  // console.log(words)
  const wordsWithSentences: WordObject[] = []
  let wordsWithoutSentences: string[] = []

  // // check if word exists in customLists
  // const customListsResults = checkIfWordsExistInLists(words, customListsStore.allLists)
  // wordsWithSentences.push(...customListsResults.matchingWordObjects)
  // wordsWithoutSentences = customListsResults.nonMatchingWords

  // check if word exists in Word Review. Even though all
  // words in Word Review are also in sentences, checking
  // Word Review first might save us a firestore read
  console.log('checking if word exists in word review')
  const wordReviewResults = useCheckIfWordsExistInWordReview(words)
  wordsWithSentences.push(...wordReviewResults.matchingWordObjects)
  // NOTE reassigning instead of pushing is necessary here
  wordsWithoutSentences = wordReviewResults.nonMatchingWords

  console.log('checking if word exists in provided lists')
  // then check if word exists in providedLists
  const providedListsResults = checkIfWordsExistInLists(
    wordsWithoutSentences,
    providedListsStore.allLists
  )
  wordsWithSentences.push(...providedListsResults.matchingWordObjects)
  wordsWithoutSentences = providedListsResults.nonMatchingWords

  // if not, check if sentences exist in firestore
  if (wordsWithoutSentences.length > 0) {
    console.log('checking if word exists in firestore')
    const firestoreResults = await checkIfWordsExistInFirestore(wordsWithoutSentences)

    if (firestoreResults.matchingWordObjects.length)
      wordsWithSentences.push(...firestoreResults.matchingWordObjects)

    if (firestoreResults.nonMatchingWords.length) {
      console.log('ready to generate openAI sentences')
      // need to sort because words in WordChallenge are sorted too,
      // so I need the first word to have its sentence generated ASAP
      const sortedNonMatchingWords = firestoreResults.nonMatchingWords.sort()
      const generatedSentencesObj = await useOpenAiSentencesGenerator(sortedNonMatchingWords)
      // console.log(generatedSentencesObj)

      // upload generated sentences to firestore so that they can be
      // retrieved from other users, saving us openAI tokens and time
      await storeSentencesInFirestore(generatedSentencesObj)
      console.log('Sentences have been stored in firestore')

      // convert generated sentences to structure of Review words
      // @ts-ignore
      for (const [word, sentences] of Object.entries(generatedSentencesObj)) {
        const wordObject = useWordObjCreator(word, sentences)
        wordsWithSentences.push(wordObject)
      }
      console.log('finished generating openAI sentences')
      // console.log(wordsWithSentences)
    }
  }

  // add any words that don't already exist in Word Review to its store
  const newWords = wordsWithSentences.filter(
    (wordObj) =>
      !wordReviewStore.allWords.some((existingWordObj) => existingWordObj.word === wordObj.word)
  )
  wordReviewStore.addWords(newWords)
  wordReviewStore.updateWordReviewInFirestore()
  // add sentences to matching words in customLists
  const list = customListsStore.allLists.find((list) => list.listNumber === listNum)
  // console.log(list)

  if (list) addSentencesToCustomList(wordsWithSentences, list)
  customListsStore.updateListsInFirestore()
}

const checkIfWordsExistInLists = (submittedWords: string[], lists: List[]) => {
  const matchingWordObjects = []
  const nonMatchingWords = []

  for (const submittedWord of submittedWords) {
    let found = false
    for (const list of lists) {
      for (const word in list.words) {
        if (submittedWord === word) {
          const wordObject = useWordObjCreator(submittedWord, list.words[word].sentences)
          matchingWordObjects.push(wordObject)
          found = true
          break
        }
      }
      if (found) break
    }
    if (!found) {
      nonMatchingWords.push(submittedWord)
    }
  }

  // console.log(matchingWordObjects)
  // console.log(nonMatchingWords)
  return { matchingWordObjects, nonMatchingWords }
}

const checkIfWordsExistInFirestore = async (words: string[]) => {
  const matchingWordObjects: WordObject[] = []
  const nonMatchingWords: string[] = []

  const q = query(collection(db, 'sentences'), where(documentId(), 'in', words))
  const querySnapshot = await getDocs(q)

  const foundWords = new Set()
  querySnapshot.forEach((doc) => {
    const word = doc.id
    const sentences = doc.data().sentences
    const wordObject = useWordObjCreator(word, sentences)
    matchingWordObjects.push(wordObject)
    foundWords.add(word)
  })

  nonMatchingWords.push(...words.filter((word) => !foundWords.has(word)))

  // console.log(matchingWordObjects)
  // console.log(nonMatchingWords)
  return { matchingWordObjects, nonMatchingWords }
}

const storeSentencesInFirestore = async (sentencesObj: Sentences): Promise<void> => {
  for (const word in sentencesObj) {
    const sentences = sentencesObj[word]
    const documentRef = doc(db, 'sentences', word)
    const documentSnapshot = await getDoc(documentRef)

    // NOTE await can be removed to allow sentences to be updated faster,
    // but this risks hitting concurrent operations limits for firestore
    if (documentSnapshot.exists()) {
      await updateDoc(documentRef, { sentences: arrayUnion(...sentences) })
    } else {
      await setDoc(documentRef, { sentences })
    }
  }
}

const addSentencesToCustomList = (wordObjects: WordObject[], list: List) => {
  for (const wordObject of wordObjects) {
    const wordInList = list.words[wordObject.word]
    if (wordInList) {
      wordInList.sentences = wordObject.sentences
    }
  }
}
