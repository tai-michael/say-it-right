import type { WordObject, WordSource } from '@/stores/modules/types/Review'

// Creates word objects with the structure of words in Review
export default function (word: string, sentences: string[], source: WordSource) {
  const wordObj: WordObject = {
    word,
    sentences,
    related_words: [],
    attempts: 0,
    attemptsSuccessful: 0,
    created: Date.now(),
    status: 'TESTING_WORD_ONLY',
    bookmarked: false,
    source
  }
  console.log(wordObj)
  return wordObj
}

// export interface WordObject {
//   word: string
//   sentences: string[]
//   related_words: string[]
//   attempts: number
//   attemptsSuccessful: number
//   created: number
//   status: WordStatus
//   source: WordSource
// }

// export type WordStatus = 'TESTING_WORD_ONLY' | 'TESTING_SENTENCES' | 'TESTING_COMPLETE'

// export type WordSource = 'CUSTOM' | 'PROVIDED'
// import type { WordSource } from '@/stores/modules/types/Review'
// route.name as WordSource
