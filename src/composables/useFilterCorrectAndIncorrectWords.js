import { useProvidedListsStore } from '@/stores/providedLists'
import { useCustomListsStore } from '@/stores/customLists'

export default function useFilterCorrectAndIncorrectWords(
  testedWords,
  transcriptString,
  routeName
) {
  const store = routeName === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

  const recordedWords = [...new Set(transcriptString.split(' '))]
  const correctWords = [...testedWords.filter((word) => recordedWords.includes(word))]

  for (const word of correctWords) {
    store.logPronunciationAttempt(word)
    store.logPronunciationAttemptSuccessful(word)
  }

  let incorrectWords = []
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
