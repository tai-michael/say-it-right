export interface List {
  listNumber: number
  listTitle: string
  status: ListStatus
  paragraph: string
  words: Words<PremadeWord> | Words<CustomWord>
}

export type ListStatus =
  | 'LIST_NOT_STARTED'
  | 'PARAGRAPH_RECORDING_ENDED'
  | 'TESTING_WORD_ONLY'
  | 'TESTING_SENTENCES'
  | 'LIST_COMPLETE'

export interface Words<T> {
  [key: string]: T
}

export interface PremadeWord {
  mispronouncedFrequentlyAs: string
  mispronunciationFrequency: number
  mistakeType: string
  essentialSound: string
  pronunciationTip: string
  attempts: number
  attemptsSuccessful: number
  sentences: string[]
}

export interface CustomWord {
  attempts: number
  attemptsSuccessful: number
  sentences: string[]
}
