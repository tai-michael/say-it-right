export default function useFilterCorrectAndIncorrectWords(testedWordList, transcriptString) {
  // TODO either here or elsewhere (probably elsewhere, early on), I need to test if a testedWord is in the actual Paragraph. And if not, I need to either slice it out or find some way to 'match' it.
  const recordedWords = [...new Set(transcriptString.split(' '))]
  const correctWords = [...testedWordList.filter((word) => recordedWords.includes(word))]

  let incorrectWords = []
  for (const word of testedWordList) {
    if (!correctWords.includes(word)) {
      incorrectWords.push(word)
    }
  }

  console.log('Correctly pronounced keywords:', correctWords.join(', '))
  console.log('Mispronounced keywords:', incorrectWords.join(', '))
  return { correctWords, incorrectWords }
}
