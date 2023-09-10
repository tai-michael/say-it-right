export interface WordObject {
  word: string
  sentences: string[]
  related_words: string[]
  attempts: number
  attemptsSuccessful: number
  created: number
  status: WordStatus
  bookmarked: boolean
  source: WordSource
}

export type WordStatus = 'TESTING_WORD_ONLY' | 'TESTING_SENTENCES' | 'TESTING_COMPLETE'

export type WordSource = 'premade-list' | 'custom-list'
