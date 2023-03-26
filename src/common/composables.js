import { stemmer } from 'stemmer'

// REVIEW potential alternative function name: useMatchTestedWordsToWordsInParagraph
export function useAdjustTestedWords(testedWordsList, testedParagraph) {
  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g

  // Splits the paragraph into an array of words and punctuation marks
  const paragraphWords = testedParagraph.match(wordRegex).map((word) => word.toLowerCase())

  // TODO in the final version, user-submitted tested words will be auto-converted to lowercase before being posted to backend, so this part will be unnecessary
  const lowercaseTestedWordsList = testedWordsList.map((word) => word.toLowerCase())

  const adjustedTestedWords = lowercaseTestedWordsList.map((testedWord) => {
    for (const paragraphWord of paragraphWords) {
      if (stemmer(testedWord) === stemmer(paragraphWord)) {
        return paragraphWord
      }
    }
    return testedWord
  })

  return adjustedTestedWords
}

export function useFilterCorrectAndIncorrectWords(testedWordsList, transcriptString) {
  // TODO either here or elsewhere (probably elsewhere, early on), I need to test if a testedWord is in the actual Paragraph. And if not, I need to either slice it out or find some way to 'match' it.
  const recordedWords = [...new Set(transcriptString.split(' '))]
  const correctWords = [...testedWordsList.filter((word) => recordedWords.includes(word))]

  let incorrectWords = []
  for (const word of testedWordsList) {
    if (!correctWords.includes(word)) {
      incorrectWords.push(word)
    }
  }

  console.log('Correctly pronounced keywords:', correctWords.join(', '))
  console.log('Mispronounced keywords:', incorrectWords.join(', '))
  return { correctWords, incorrectWords }
}
