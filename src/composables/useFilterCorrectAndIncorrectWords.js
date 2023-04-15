import { useSuggestedListStore } from '@/stores/suggested'
import { usePersonalListStore } from '@/stores/personal'

export default function useFilterCorrectAndIncorrectWords(testedWords, transcriptString, route) {
  const store = route === 'suggested' ? useSuggestedListStore() : usePersonalListStore()

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
