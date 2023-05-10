import useWordObjCreator from '@/composables/useWordObjCreator'
import { useReviewStore } from '@/stores/index.ts'

// Review will contain all sentences that have been generated for custom lists
export default function (submittedWords: string[]) {
  const store = useReviewStore()

  const matchingWordObjects = []
  const nonMatchingWords = []

  for (const submittedWord of submittedWords) {
    let found = false
    for (const reviewWord of store.allWords) {
      if (submittedWord === reviewWord.word) {
        const wordObject = useWordObjCreator(submittedWord, reviewWord.sentences)
        matchingWordObjects.push(wordObject)
        found = true
        break
      }
    }
    if (!found) {
      nonMatchingWords.push(submittedWord)
    }
  }

  // console.log(matchingWordObjects)
  // console.log(nonMatchingWords)
  return { matchingWordObjects, nonMatchingWords }
}
