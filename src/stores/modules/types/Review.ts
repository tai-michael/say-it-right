export interface WordObject {
  word: string
  sentences: string[]
  attempts: number
  attemptsSuccessful: number
  status: 'TESTING_WORD_ONLY' | 'TESTING_SENTENCES'
  created: number
}
