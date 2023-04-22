export interface List {
  listNumber: number
  status: ListStatus
  paragraph: string
  words: Words<ProvidedWord> | Words<CustomWord>
}

export type ListStatus =
  | 'LIST_NOT_STARTED'
  | 'PARAGRAPH_RECORDING_ENDED'
  | 'WORD_CHALLENGE_STARTED'
  | 'SENTENCE_CHALLENGE_STARTED'
  | 'LIST_COMPLETED'

export interface Words<T> {
  [key: string]: T
}

export interface ProvidedWord {
  mispronouncedFrequentlyAs: string
  mispronunciationFrequency: number
  mistakeType: string
  essentialSound: string
  pronunciationTip: string
  attempts: number
  attemptsSuccessful: number
}

export interface CustomWord {
  attempts: number
  attemptsSuccessful: number
}
