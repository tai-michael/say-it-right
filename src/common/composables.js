export function useFilterCorrectAndIncorrectWords(transcriptString, testedKeywordsArray) {
  const recordedWords = [...new Set(transcriptString.split(' '))]
  const correctWords = [...testedKeywordsArray.filter((word) => recordedWords.includes(word))]

  let incorrectWords = []
  for (const word of testedKeywordsArray) {
    if (!correctWords.includes(word)) {
      incorrectWords.push(word)
    }
  }

  console.log('Correctly pronounced keywords:', correctWords.join(', '))
  console.log('Mispronounced keywords:', incorrectWords.join(', '))
  return { correctWords, incorrectWords }
}
