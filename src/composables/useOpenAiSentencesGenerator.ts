import axios from 'axios'

// NOTE Can make it so that only authenticated users can create sentences,
// in which case use 'callable functions'
// (For more details, see: https://stackoverflow.com/a/56837672/19905038)
// May need to create firebase function inside say-it-right project
// Then initialize the app with it (along with auth / firestore)

export default async function useOpenAiSentencesGenerator(words: string[]) {
  try {
    const url = import.meta.env.VITE_SENTENCES_GENERATOR_ENDPOINT
    const query = words.join(', ')
    const params = { query }
    const response = await axios.get(url, { params })
    console.log(response)
    const content = response?.data?.choices[0]?.message?.content
    console.log(content)
    const sentencesObject = processJsonString(content)
    console.log(sentencesObject)
    return sentencesObject
  } catch (err) {
    throw new Error(`Failed to create sentences with openAI: ${err}`)
  }
}

function processJsonString(jsonString: string) {
  // Take only string portion between first and last curly bracers
  const jsonRegex = /{.*}/s
  // @ts-ignore
  const fixedString = jsonString.match(jsonRegex)[0]

  return JSON.parse(fixedString)
}
