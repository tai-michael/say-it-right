import axios from 'axios'
import { NoSimilarSoundingWordsError } from '@/stores/modules/types/Errors'

// NOTE Can make it so that only authenticated users can create sentences,
// in which case use 'callable functions'
// (For more details, see: https://stackoverflow.com/a/56837672/19905038)
// May need to create firebase function inside say-it-right project
// Then initialize the app with it (along with auth / firestore)

export default async function (word: string) {
  try {
    console.log('Generating related words using OpenAI...')
    console.log(word)
    const url = import.meta.env.VITE_RELATED_WORDS_GENERATOR_ENDPOINT
    const query = word
    const params = { query }
    const response = await axios.get(url, { params })
    console.log(response)
    const content = response?.data?.choices[0]?.message?.content
    console.log(content)
    if (!content) {
      throw new Error('No content found in response')
    }

    const relatedWordsArray = createArrayFromString(content)
    console.log(relatedWordsArray)

    return relatedWordsArray
  } catch (err) {
    throw err
    // const newError = new Error(`Failed to generate related words with openAI: ${err.message}`);
    // newError.originalError = err; // Attach the original error as a property
    // throw newError;
  }
}

const createArrayFromString = (jsonString: string) => {
  const stringWithoutQuotes = jsonString.replace(/['"]+/g, '')
  const arr = stringWithoutQuotes
    .toLowerCase()
    .split(',')
    .map((str) => str.trim())

  if (arr.length === 1) throw new NoSimilarSoundingWordsError()
  return arr
}
