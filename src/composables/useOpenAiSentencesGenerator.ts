import axios from 'axios'

// NOTE Can make it so that only authenticated users can create sentences,
// in which case use 'callable functions'
// (For more details, see: https://stackoverflow.com/a/56837672/19905038)
// May need to create firebase function inside say-it-right project
// Then initialize the app with it (along with auth / firestore)

export default async function (mispronouncedWords: string[]) {
  try {
    const url = import.meta.env.VITE_SENTENCES_GENERATOR_ENDPOINT
    const query = mispronouncedWords.join(', ')
    const params = { query }
    const response = await axios.get(url, { params })
    console.log(response)
    const content = response?.data?.choices[0]?.message?.content
    console.log(content)

    // Take only string portion between first and last curly bracers
    const sentencesObject = extractObjectFromString(content)
    console.log(sentencesObject)

    // Matches only values that match mispronounced words.
    // Necessary because sometimes chatGPT inserts its own random words
    const finalSentencesObject = filterMatchingWords(sentencesObject, mispronouncedWords)
    console.log(finalSentencesObject)
    return finalSentencesObject
  } catch (err) {
    throw new Error(`Failed to create sentences with openAI: ${err}`)
  }
}

const extractObjectFromString = (jsonString: string) => {
  const jsonRegex = /{.*}/s
  // @ts-ignore
  const fixedString = jsonString.match(jsonRegex)[0]

  return JSON.parse(fixedString)
}

// @ts-ignore
const filterMatchingWords = (dataObject, wordsArray: string[]) => {
  const result = wordsArray.reduce((acc, word) => {
    if (dataObject[word]) {
      // @ts-ignore
      acc[word] = dataObject[word]
    }
    return acc
  }, {})

  return result
}
