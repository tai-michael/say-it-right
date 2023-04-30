import { db } from '@/firebaseInit'
import { doc } from 'firebase/firestore'
import useOpenAiSentencesGenerator from '@/composables/useOpenAiSentencesGenerator'

export default async function (words: string[]) {
  let wordsWithExistingSentences = []
  let wordsWithoutExistingSentences = []

  const getWordsWithoutExistingSentences = (words: string[]) => {
    // Search firestore Sentences collection and Review (b/c they might be reviewing a list) for existing sentences for each word. Generate two arrays*:
    // wordsWithExistingSentences = ...
    // wordsWithoutExistingSentences = ...
    // (either inside or outside the function, sort wordsWithoutExistingSentences by alphabetical order, so that if the first word in WordChallenge is w/o sentences, it'll have its sentences generated first.)
  }

  getWordsWithoutExistingSentences(words)

  const firstCoupleWords = words.slice(0, 2)
  const remainingWords = words.slice(2)

  // NOTE put below in two functions with parameter firstCoupleWords and remainingWords, respectively
  const placeholderNameFunction = async (wordsThatNeedSentences: string[]) => {
    const newlyCreatedSentences = await useOpenAiSentencesGenerator(firstCoupleWords)

    const newlyCreatedSentencesObj = JSON.parse(newlyCreatedSentences)

    const wordRef = doc(db, 'sentences_for_words')

    // repeat query above (can create function with it and run it again) to filter for only words that dont exist in the collection:
    getWordsWithoutExistingSentences(wordsThatNeedSentences)

    // Then, array union it if possible.

    // store each set of sentences in its corresponding word object in provided lists

    // update providedLists in user's firestore
  }

  if (words.length >= 4) {
    await placeholderNameFunction(firstCoupleWords)
    await placeholderNameFunction(remainingWords)
    return
  }

  await placeholderNameFunction(words)

  // NOTE important: if a word exists in the collection, always just retrieve its first two sentences. Then it doesn't matter if multiple ppl happen to create + send sentences (which will likely be identical) to a word at the same time. In Word Review, when user chooses to practice with more sentences, do an actual api call to openAI

  // console.log(newlyCreatedSentencesObj['four'][0])
}
