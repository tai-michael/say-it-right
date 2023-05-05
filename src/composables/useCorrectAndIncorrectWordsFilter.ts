import { useProvidedListsStore } from '@/stores'
import { useCustomListsStore } from '@/stores'
import { metaphone } from 'metaphone'

export default function useCorrectAndIncorrectWordsFilter(
  testedWords: string[],
  transcriptString: string,
  routeName: string | unknown
) {
  const store = routeName === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

  //TODO use metaphone here for extra safety
  const recordedWords = [...new Set(transcriptString.split(' '))]
  const correctWords = [...testedWords.filter((word) => recordedWords.includes(word))]

  for (const word of correctWords) {
    store.logPronunciationAttempt(word)
    store.logPronunciationAttemptSuccessful(word)
  }

  const incorrectWords = []
  for (const word of testedWords) {
    if (!correctWords.includes(word)) {
      incorrectWords.push(word)
      store.logPronunciationAttempt(word)
    }
  }

  console.log('Correctly pronounced keywords:', correctWords.join(', '))
  console.log('Mispronounced keywords:', incorrectWords.join(', '))
  return { correctWords, incorrectWords }
}
