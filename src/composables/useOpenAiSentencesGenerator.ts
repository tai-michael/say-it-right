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
    return processJsonString(content)
  } catch (err) {
    throw new Error(`Failed to create sentences with openAI: ${err}`)
  }
}

// NOTE chatGPT3.5 sometimes returns a string that encloses the curly bracers with double quotes instead of the single quotes that are needed for JSON.parse to work. Hence, the necessity for these functions.
function isJsonString(str: string) {
  try {
    JSON.parse(str)
  } catch (err) {
    return false
  }
  return true
}

function fixJsonString(jsonString: string) {
  const fixedString = jsonString
    .replace(/^"/, "'")
    .replace(/"$/, "'")
    .replace(/([^\\])"/g, '$1\\"')
  return fixedString
}

function processJsonString(jsonString: string) {
  if (!isJsonString(jsonString)) {
    const fixedString = fixJsonString(jsonString)
    return JSON.parse(fixedString)
  }
  return JSON.parse(jsonString)
}
