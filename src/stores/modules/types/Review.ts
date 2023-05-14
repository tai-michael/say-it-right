export interface WordObject {
  word: string
  sentences: string[]
  attempts: number
  attemptsSuccessful: number
  status: WordStatus
  created: number
  related_words: string[]
}

export type WordStatus = 'TESTING_WORD_ONLY' | 'TESTING_SENTENCES' | 'TESTING_COMPLETE'
