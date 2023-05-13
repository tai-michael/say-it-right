import { metaphone } from 'metaphone'

export default function (transcriptWords: string[], testedWord: string) {
  console.log(transcriptWords)

  const finalTranscriptWord = transcriptWords[transcriptWords.length - 1]

  const transcribedWordCode = getPhoneticCode(finalTranscriptWord)
  // TODO pass wordName as param
  const testedWordPhoneticCode = getPhoneticCode(testedWord)

  if (transcribedWordCode === testedWordPhoneticCode) {
    console.log('match found')
    // const matchingWord = testedWord
    // return matchingWord
    return true
  }
  console.log('match not found')
  // return ''
  return false
}

const getPhoneticCode = (word: string) => {
  return metaphone(word)
}
