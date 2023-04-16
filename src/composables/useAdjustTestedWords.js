import { useProvidedListsStore } from '@/stores/providedLists'
import { useCustomListsStore } from '@/stores/customLists'
// NOTE used for useAdjustTestedWords composable
import stem from 'wink-porter2-stemmer'

export default function useAdjustTestedWords(testedWords, testedParagraph, routeName) {
  const store = routeName === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g
  // Splits the paragraph into an array of words and punctuation marks
  // TODO in the final version, user-submitted tested words will be auto-converted to lowercase before being posted to backend, so toLowerCase will be unnecessary
  const paragraphWords = testedParagraph.match(wordRegex).map((word) => word.toLowerCase())

  const adjustedTestedWordsObj = {}

  const keys = Object.keys(testedWords)
  for (const key of keys) {
    const lowercaseTestedWord = key.toLowerCase()
    let result = lowercaseTestedWord
    for (const paragraphWord of paragraphWords) {
      if (stem(lowercaseTestedWord) === stem(paragraphWord)) {
        result = paragraphWord
        break
      }
    }
    adjustedTestedWordsObj[result] = testedWords[key]
  }

  store.setTestedWordsObj(adjustedTestedWordsObj)

  const adjustedTestedWords = [...Object.keys(adjustedTestedWordsObj)]
  return adjustedTestedWords
}
