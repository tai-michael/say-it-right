import { useCustomListsStore } from '@/stores'
import { useProvidedListsStore } from '@/stores'
import usePhoneticConverter from '@/composables/usePhoneticConverter'

export default function (
  testedWords: string[],
  transcriptString: string,
  routeName: string | unknown
) {
  const store = routeName === 'provided-list' ? useProvidedListsStore() : useCustomListsStore()

  const recordedWords = [...new Set(transcriptString.split(' '))]
  const testedWordsPhonetic = testedWords.map((word) => usePhoneticConverter(word))
  const recordedWordsPhonetic = recordedWords.map((word) => usePhoneticConverter(word))

  const correctWords = []
  const incorrectWords = []

  for (const [index, testedWordPhonetic] of testedWordsPhonetic.entries()) {
    const foundIndex = recordedWordsPhonetic.findIndex(
      (recordedWordPhonetic) => testedWordPhonetic === recordedWordPhonetic
    )

    if (foundIndex !== -1) {
      correctWords.push(testedWords[index])
      store.logPronunciationAttempt(testedWords[index])
      store.logPronunciationAttemptSuccessful(testedWords[index])
    } else {
      incorrectWords.push(testedWords[index])
      store.logPronunciationAttempt(testedWords[index])
    }
  }

  console.log('Correctly pronounced keywords:', correctWords.join(', '))
  console.log('Mispronounced keywords:', incorrectWords.join(', '))
  return { correctWords, incorrectWords }
}
