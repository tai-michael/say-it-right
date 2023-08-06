import usePhoneticConverter from '@/composables/usePhoneticConverter'

export default function (transcriptWords: string[], testedWord: string) {
  console.log(transcriptWords)

  const finalTranscriptWord = transcriptWords[transcriptWords.length - 1]

  const transcribedWordCode = usePhoneticConverter(finalTranscriptWord)
  const testedWordPhoneticCode = usePhoneticConverter(testedWord)
  console.log(
    `user phonetic code: ${transcribedWordCode}, tested phonetic code: ${testedWordPhoneticCode}`
  )

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
