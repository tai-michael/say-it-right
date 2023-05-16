import axios from 'axios'

// NOTE Can make it so that only authenticated users can create sentences,
// in which case use 'callable functions'
// (For more details, see: https://stackoverflow.com/a/56837672/19905038)
// May need to create firebase function inside say-it-right project
// Then initialize the app with it (along with auth / firestore)

export default async function (word: string) {
  try {
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

    // Take only string portion between first and last brackets []
    const relatedWordsArray = extractArrayFromString(content)
    console.log(relatedWordsArray)

    return relatedWordsArray
  } catch (err) {
    throw new Error(`Failed to generate related words with openAI: ${err}`)
  }
}

const extractArrayFromString = (jsonString: string) => {
  const jsonRegex = /\[.*?\]/s
  const fixedString = jsonString.replace(/'/g, '"')
  const extractedArrayString = fixedString?.match(jsonRegex)?.[0] ?? ''

  return JSON.parse(extractedArrayString)
}