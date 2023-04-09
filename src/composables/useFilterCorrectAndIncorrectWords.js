import { useSuggestedListStore } from '@/stores/suggested'
import { usePersonalListStore } from '@/stores/personal'
import { useRoute } from 'vue-router'

export default function useFilterCorrectAndIncorrectWords(testedWordList, transcriptString) {
  const route = useRoute()
  const store = route.name === 'suggested' ? useSuggestedListStore() : usePersonalListStore()

  const recordedWords = [...new Set(transcriptString.split(' '))]
  const correctWords = [...testedWordList.filter((word) => recordedWords.includes(word))]

  for (const word of correctWords) {
    store.logPronunciationAttempt(word)
    store.logPronunciationAttemptSuccessful(word)
  }

  for (const word of testedWordList) {
    if (!correctWords.includes(word)) store.logPronunciationAttempt(word)
  }
}
