export class NoSimilarSoundingWordsError extends Error {
  constructor(
    message = 'OpenAI failed to find similar-sounding words, so related words not generated'
  ) {
    super(message)
    this.name = 'NoSimilarSoundingWordsError'
  }
}
