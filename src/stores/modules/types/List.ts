export interface List {
  listNumber: number
  status: ListStatus
  paragraph: string
  words: Words
}

export type ListStatus =
  | 'LIST_NOT_STARTED'
  | 'PARAGRAPH_RECORDING_ENDED'
  | 'WORD_CHALLENGE_STARTED'
  | 'SENTENCE_CHALLENGE_STARTED'
  | 'LIST_COMPLETED'

export interface Words {
  [key: string]: Word
}

export interface Word {
  mispronouncedFrequentlyAs: string
  mispronunciationFrequency: number
  mistakeType: string
  essentialSound: string
  pronunciationTip: string
  attempts: number
  attemptsSuccessful: number
}
