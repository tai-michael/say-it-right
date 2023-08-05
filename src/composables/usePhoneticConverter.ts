import { dictionary } from '@/assets/ipa_dict'
import { metaphone } from 'metaphone'

// export default function (pronouncedWord: string, testedWord: string) {
export default function (word: string) {
  console.log(dictionary[word])
  console.log(metaphone(word))
  return dictionary[word] ? dictionary[word] : metaphone(word)

  // e.g. 'sanjo' (which is speechly's transcription of "zhenzhu")
}

// export default function (transcriptWords: string[], testedWord: string) {
//   console.log(transcriptWords)

//   const finalTranscriptWord = transcriptWords[transcriptWords.length - 1]

//   const transcribedWordCode = getPhoneticCode(finalTranscriptWord)
//   const testedWordPhoneticCode = getPhoneticCode(testedWord)

//   if (transcribedWordCode === testedWordPhoneticCode) {
//     console.log('match found')
//     // const matchingWord = testedWord
//     // return matchingWord
//     return true
//   }
//   console.log('match not found')
//   // return ''
//   return false
// }

// const getPhoneticCode = (word: string) => {
//   return metaphone(word)
// }
