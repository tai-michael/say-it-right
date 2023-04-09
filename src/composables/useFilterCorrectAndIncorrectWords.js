import { useSuggestedListStore } from '@/stores/suggested'
import { usePersonalListStore } from '@/stores/personal'

export default function useFilterCorrectAndIncorrectWords(testedWordList, transcriptString, route) {
  const store = route === 'suggested' ? useSuggestedListStore() : usePersonalListStore()

  const recordedWords = [...new Set(transcriptString.split(' '))]
  const correctWords = [...testedWordList.filter((word) => recordedWords.includes(word))]

  for (const word of correctWords) {
    store.logPronunciationAttempt(word)
    store.logPronunciationAttemptSuccessful(word)
  }

  let incorrectWords = []
  for (const word of testedWordList) {
    if (!correctWords.includes(word)) {
      incorrectWords.push(word)
      store.logPronunciationAttempt(word)
    }
  }

  console.log('Correctly pronounced keywords:', correctWords.join(', '))
  console.log('Mispronounced keywords:', incorrectWords.join(', '))
  return { correctWords, incorrectWords }
}
