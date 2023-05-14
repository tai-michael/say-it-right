import { metaphone } from 'metaphone'
import stem from 'wink-porter2-stemmer'

// TODO fix this function so it works with a modified word with an accent (e.g. 'cafés' modified by chatGPT into 'café'. Phonetic code would be 'KFS', while transcription would be 'KF'. Stemmer doesn't help b/c it returns accented stem.)
export default function (transcriptWords: string[], testedWord: string, testedSentence: string) {
  // NOTE it's necessary to check for either matches, as sometimes the right word is mistranscribed (e.g. transcribed as 'board' instead of 'bored'), and other times it gets modified by openAI when placed into a sentence (e.g. becoming 'chatted' instead of 'chatting')
  return (
    checkForPhoneticCodeMatch(transcriptWords, testedWord) ||
    checkForWordStemMatch(transcriptWords, testedWord, testedSentence)
  )
}

// NOTE convert any mistranscribed word to the tested word if they sound the same
const checkForPhoneticCodeMatch = (transcriptWords: string[], testedWord: string) => {
  // TODO pass wordName as param
  const testedWordPhoneticCode = getPhoneticCode(testedWord)
  for (const transcriptWord of transcriptWords) {
    const transcriptWordPhoneticCode = metaphone(transcriptWord)
    if (transcriptWordPhoneticCode === testedWordPhoneticCode) {
      console.log(transcriptWordPhoneticCode)
      console.log(testedWordPhoneticCode)
      // return transcriptWord
      return true
    }
  }
  // return ''
  return false
}

const checkForWordStemMatch = (
  transcriptWords: string[],
  testedWord: string,
  testedSentence: string
) => {
  // Matches any sequence of characters that are not whitespace or certain punctuation marks, including the punctuation marks themselves
  const wordRegex = /(?:[^\s.,;:!?"'’“”()[\]{}<>«»]+)|(?:[.,;:!?"'’“”()[\]{}<>«»]+)/g
  // Splits the sentence into an array of words and punctuation marks, allowing us to ignore punctuation marks when crosschecking for the correct pronunciation below
  // @ts-ignore
  const sentenceWords = testedSentence.match(wordRegex).map((word) => word.toLowerCase())
  const testedWordStem = stem(testedWord)

  for (const sentenceWord of sentenceWords) {
    const sentenceWordStem = stem(sentenceWord)

    const matchesTranscriptWord = transcriptWords.some((transcriptWord) => {
      const transcriptWordStem = stem(transcriptWord)
      return sentenceWordStem === transcriptWordStem
    })

    if (matchesTranscriptWord && sentenceWordStem === testedWordStem) return true
  }
  return false
}

const getPhoneticCode = (word: string) => {
  return metaphone(word)
}
