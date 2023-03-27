// NOTE used for useAdjustTestedWords composable
import stem from 'wink-porter2-stemmer'

// REVIEW potential alternative function name: useMatchTestedWordsToWordsInParagraph
export default function useAdjustTestedWords(testedWordsList, testedParagraph) {
  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g

  // Splits the paragraph into an array of words and punctuation marks
  const paragraphWords = testedParagraph.match(wordRegex).map((word) => word.toLowerCase())

  // TODO in the final version, user-submitted tested words will be auto-converted to lowercase before being posted to backend, so this part will be unnecessary
  const lowercaseTestedWordsList = testedWordsList.map((word) => word.toLowerCase())

  const adjustedTestedWords = lowercaseTestedWordsList.map((testedWord) => {
    for (const paragraphWord of paragraphWords) {
      if (stem(testedWord) === stem(paragraphWord)) {
        return paragraphWord
      }
    }
    return testedWord
  })

  return adjustedTestedWords
}
