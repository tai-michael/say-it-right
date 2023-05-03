import useOpenAiSentencesGenerator from '@/composables/useOpenAiSentencesGenerator'
import type { Sentences } from '@/stores/modules/types/Sentences'
import type { WordObject } from '@/stores/modules/types/Review'
import type { List } from '@/stores/modules/types/List'
import { db } from '@/firebaseInit'
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useCustomListsStore, useProvidedListsStore, useWordReviewStore } from '@/stores/index.ts'

export default async function (words: string[], listNum: number) {
  const wordReviewStore = useWordReviewStore()
  const customListsStore = useCustomListsStore()
  const providedListsStore = useProvidedListsStore()

  const wordsWithSentences: WordObject[] = []
  let wordsWithoutSentences = []

  // check if word exists in customLists
  const customListsResults = checkIfWordExistsInLists(words, customListsStore.allLists)
  wordsWithSentences.push(...customListsResults.matchingWordObjects)
  wordsWithoutSentences = customListsResults.nonMatchingWords

  // then check if word exists in providedLists
  const providedListsResults = checkIfWordExistsInLists(
    wordsWithoutSentences,
    providedListsStore.allLists
  )
  wordsWithSentences.push(...providedListsResults.matchingWordObjects)
  wordsWithoutSentences = providedListsResults.nonMatchingWords

  // if not, check if sentences exist in firestore
  if (!wordsWithSentences.length) {
    const firestoreResults = await checkIfWordExistsInFirestore(words)

    if (firestoreResults.matchingWordObjects.length)
      wordsWithSentences.push(...firestoreResults.matchingWordObjects)
    else {
      // and generate sentences that don't already exist
      const generatedSentencesObj = await useOpenAiSentencesGenerator(
        firestoreResults.nonMatchingWords
      )
      console.log(generatedSentencesObj)

      // upload generated sentences to firestore so that they can be
      // retrieved from other users, saving us openAI tokens and time
      await storeSentencesInFirestore(generatedSentencesObj)
      console.log('Sentences have been stored in firestore')

      // convert generated sentences to structure of Review words...
      for (const [word, sentences] of Object.entries(generatedSentencesObj)) {
        const wordObject = createWordObject(word, sentences)
        wordsWithSentences.push(wordObject)
      }
    }
  }

  // so that they can also be added -- along with other words
  // with sentences -- to Word Review
  wordReviewStore.addWords(wordsWithSentences)
  wordReviewStore.updateWordReviewInFirestore()
  // add sentences to matching words in customLists
  const list = customListsStore.allLists.find((list) => list.listNumber === listNum)
  console.log(list)

  if (list) addSentencesToCustomList(wordsWithSentences, list)
  customListsStore.updateListsInFirestore()
}

const checkIfWordExistsInLists = (submittedWords: string[], lists: List[]) => {
  const matchingWordObjects = []
  const nonMatchingWords = []

  for (const submittedWord of submittedWords) {
    for (const list of lists) {
      for (const word in list.words) {
        if (submittedWord === word) {
          const wordObject = createWordObject(submittedWord, list.words[word].sentences)
          matchingWordObjects.push(wordObject)
        } else {
          nonMatchingWords.push(submittedWord)
        }
      }
    }
  }

  console.log(matchingWordObjects)
  console.log(nonMatchingWords)
  return { matchingWordObjects, nonMatchingWords }
}

const checkIfWordExistsInFirestore = async (words: string[]) => {
  const matchingWordObjects = []
  const nonMatchingWords = []

  for (const word in words) {
    const documentRef = doc(db, 'sentences', word)
    const documentSnapshot = await getDoc(documentRef)

    if (documentSnapshot.exists()) {
      const sentences = documentSnapshot.data().sentences
      const wordObject = createWordObject(word, sentences)
      matchingWordObjects.push(wordObject)
    } else {
      nonMatchingWords.push(word)
    }
  }

  console.log(matchingWordObjects)
  console.log(nonMatchingWords)
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

const createWordObject = (word: string, sentences: string[]) => {
  const wordObj = {
    word,
    sentences,
    attempts: 0,
    attemptsSuccessful: 0,
    created: Date.now()
  }
  console.log(wordObj)
  return wordObj
}

const addSentencesToCustomList = (wordObjects: WordObject[], list: List) => {
  for (const wordObject of wordObjects) {
    const wordInList = list.words[wordObject.word]
    if (wordInList) {
      wordInList.sentences = wordObject.sentences
    }
  }
}

// // Word Review will contain all sentences that have been generated for custom lists
// const checkIfWordExistsInWordReview = async (submittedWords: string[]) => {
//   const wordReviewStore = useWordReviewStore()
//   wordReviewStore.allWords

//   const matchingWordObjects = [];

//   for (const submittedWord of submittedWords) {
//     for (const reviewWord of wordReviewStore.allWords) {
//       if (submittedWord === reviewWord.word) {
//         const wordObject = createWordObject(submittedWord, reviewWord.sentences);
//         matchingWordObjects.push(wordObject);
//       }
//     }
//   }

//   console.log(matchingWordObjects);
//   return matchingWordObjects;
// }
