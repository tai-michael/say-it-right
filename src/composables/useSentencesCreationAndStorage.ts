import useOpenAiSentencesGenerator from '@/composables/useOpenAiSentencesGenerator'
import useAsyncCallWithRetries from '@/composables/useAsyncCallWithRetries'
import useWordObjCreator from '@/composables/useWordObjCreator'
import useCheckIfWordsExistInReview from '@/composables/useCheckIfWordsExistInReview'
import type { Sentences } from '@/stores/modules/types/Sentences'
import type { WordObject, WordSource } from '@/stores/modules/types/Review'
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
import { useCustomListsStore, usePremadeListsStore, useReviewStore } from '@/stores/index.ts'

export default async function (words: string[], source: WordSource, listNum?: number) {
  const reviewStore = useReviewStore()
  const customListsStore = useCustomListsStore()
  const premadeListsStore = usePremadeListsStore()

  // console.log(words)
  const wordsWithSentences: WordObject[] = []
  let wordsWithoutSentences: string[] = []

  // Check if word exists in customLists
  // const customListsResults = checkIfWordsExistInLists(words, customListsStore.allLists)
  // wordsWithSentences.push(...customListsResults.matchingWordObjects)
  // wordsWithoutSentences = customListsResults.nonMatchingWords

  // Check if word exists in Review. Even though all
  // words in Review are also in sentences, checking
  // Review first might save us a firestore read
  console.log('checking if word exists in Review')
  const reviewResults = useCheckIfWordsExistInReview(words, source)
  wordsWithSentences.push(...reviewResults.matchingWordObjects)
  // NOTE reassigning instead of pushing is necessary here
  wordsWithoutSentences = reviewResults.nonMatchingWords

  console.log('checking if word exists in premade lists')
  // Then check if word exists in premadeLists
  const premadeListsResults = checkIfWordsExistInPremadeLists(
    wordsWithoutSentences,
    premadeListsStore.allLists
  )
  wordsWithSentences.push(...premadeListsResults.matchingWordObjects)
  wordsWithoutSentences = premadeListsResults.nonMatchingWords

  // If not, check if sentences exist in firestore
  if (wordsWithoutSentences.length > 0) {
    console.log('checking if word exists in firestore')
    const firestoreResults = await checkIfWordsExistInFirestore(wordsWithoutSentences, source)

    if (firestoreResults.matchingWordObjects.length)
      wordsWithSentences.push(...firestoreResults.matchingWordObjects)

    if (firestoreResults.nonMatchingWords.length) {
      console.log('generating openAI sentences...')
      // Need to sort because words in WordChallenge are sorted too,
      // meaning we need to generate the sentences for the first word ASAP
      const sortedNonMatchingWords = firestoreResults.nonMatchingWords.sort()
      const generatedSentencesObj = await useAsyncCallWithRetries(() =>
        useOpenAiSentencesGenerator(sortedNonMatchingWords)
      )
      // console.log(generatedSentencesObj)

      // Upload generated sentences to firestore so that they can be
      // retrieved from other users, saving time and openAI tokens
      await storeSentencesInFirestore(generatedSentencesObj)
      console.log('Sentences have been stored in firestore')

      // Convert generated sentences to structure of Review words
      // @ts-ignore
      for (const [word, sentences] of Object.entries(generatedSentencesObj)) {
        const wordObject = useWordObjCreator(word, sentences, source)
        wordsWithSentences.push(wordObject)
      }
      console.log('finished generating openAI sentences')
      // console.log(wordsWithSentences)
    }
  }

  // Add any words that don't already exist in Review to its store
  const newWords = wordsWithSentences.filter(
    (wordObj) =>
      !reviewStore.allWords.some((existingWordObj) => existingWordObj.word === wordObj.word)
  )
  if (newWords.length) {
    reviewStore.addWords(newWords)
    reviewStore.updateReviewInFirestore()
  }

  // Add sentences to matching words in customLists
  if (source === 'custom-list') {
    if (listNum) {
      const list = customListsStore.allLists.find((list) => list.listNumber === listNum)
      if (list) addSentencesToCustomList(wordsWithSentences, list)
      // Returns words for short custom lists (ones without paragraphs)
    } else return wordsWithSentences
  }
}

const checkIfWordsExistInPremadeLists = (submittedWords: string[], lists: List[]) => {
  const matchingWordObjects = []
  const nonMatchingWords = []

  for (const submittedWord of submittedWords) {
    let found = false
    for (const list of lists) {
      for (const word in list.words) {
        if (submittedWord === word) {
          const wordObject = useWordObjCreator(
            submittedWord,
            list.words[word].sentences,
            'premade-list'
          )
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

const checkIfWordsExistInFirestore = async (words: string[], routeName: WordSource) => {
  const matchingWordObjects: WordObject[] = []
  const nonMatchingWords: string[] = []

  const q = query(collection(db, 'sentences'), where(documentId(), 'in', words))
  const querySnapshot = await getDocs(q)

  const foundWords = new Set()
  querySnapshot.forEach((doc) => {
    const word = doc.id
    const sentences = doc.data().sentences
    const wordObject = useWordObjCreator(word, sentences, routeName)
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
