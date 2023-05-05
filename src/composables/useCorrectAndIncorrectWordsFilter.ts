import { useProvidedListsStore } from '@/stores'
import { useCustomListsStore } from '@/stores'
import { metaphone } from 'metaphone'

export default function useCorrectAndIncorrectWordsFilter(
  testedWords: string[],
  transcriptString: string,
  routeName: string | unknown
) {
  const store = routeName === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

  //NOTE metaphone allows us to get the Phonetic code of a word
  // it's used below in case a correctly pronounced word is mistranscribed
  // it also helps if there's an accented word in the paragraph (e.g. café)
  const recordedWords = [...new Set(transcriptString.split(' '))]
  const testedWordsPhonetic = testedWords.map((word) => metaphone(word))
  const recordedWordsPhonetic = recordedWords.map((word) => metaphone(word))

  const correctWords = []
  const incorrectWords = []

  for (const [index, testedWordPhonetic] of testedWordsPhonetic.entries()) {
    const foundIndex = recordedWordsPhonetic.findIndex(
      (recordedWordPhonetic) => testedWordPhonetic === recordedWordPhonetic
    )

    if (foundIndex !== -1) {
      correctWords.push(testedWords[index])
      store.logPronunciationAttempt(testedWords[index])
      store.logPronunciationAttemptSuccessful(testedWords[index])
    } else {
      incorrectWords.push(testedWords[index])
      store.logPronunciationAttempt(testedWords[index])
    }
  }

  console.log('Correctly pronounced keywords:', correctWords.join(', '))
  console.log('Mispronounced keywords:', incorrectWords.join(', '))
  return { correctWords, incorrectWords }
}
