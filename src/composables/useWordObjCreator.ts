// Creates word objects with the structure of words in Review
export default function (word: string, sentences: string[]) {
  const wordObj = {
    word,
    sentences,
    attempts: 0,
    attemptsSuccessful: 0,
    status: 'TESTING_WORD_ONLY',
    created: Date.now()
  }
  console.log(wordObj)
  return wordObj
}
