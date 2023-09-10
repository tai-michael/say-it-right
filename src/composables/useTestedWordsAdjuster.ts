import type { CustomWord, PremadeWord, Words } from '@/stores/modules/types/List'
import { usePremadeListsStore } from '@/stores'
import { useCustomListsStore } from '@/stores'
// NOTE used for useTestedWordsAdjuster composable
import stem from 'wink-porter2-stemmer'

export default function (
  testedWords: Words<PremadeWord> | Words<CustomWord>,
  testedParagraph: string,
  routeName: string | unknown
) {
  const store = routeName === 'premade-list' ? usePremadeListsStore() : useCustomListsStore()

  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g
  // Splits the paragraph into an array of words and punctuation marks
  // @ts-ignore
  const paragraphWords = testedParagraph.match(wordRegex).map((word) => word.toLowerCase())

  const adjustedTestedWordsObj: Words<PremadeWord> | Words<CustomWord> = {}

  const keys = Object.keys(testedWords)
  for (const key of keys) {
    let result = key
    for (const paragraphWord of paragraphWords) {
      if (stem(key) === stem(paragraphWord)) {
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
