// Creates word objects with the structure of words in Word Review
export default function (word: string, sentences: string[]) {
  const wordObj = {
    word,
    sentences,
    attempts: 0,
    attemptsSuccessful: 0,
    created: Date.now()
  }
  console.log(wordObj)
  return wordObj
}
