import usePhoneticConverter from '@/composables/usePhoneticConverter'
// import { metaphone } from 'metaphone'

export default function (transcriptWords: string[], testedWord: string) {
  console.log(transcriptWords)

  const finalTranscriptWord = transcriptWords[transcriptWords.length - 1]

  const transcribedWordCode = usePhoneticConverter(finalTranscriptWord)
  const testedWordPhoneticCode = usePhoneticConverter(testedWord)

  if (transcribedWordCode === testedWordPhoneticCode) {
    console.log(`match found: ${transcribedWordCode}, ${testedWordPhoneticCode}`)
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
