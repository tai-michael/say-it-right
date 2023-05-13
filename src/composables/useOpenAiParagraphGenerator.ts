import axios from 'axios'

// NOTE Can make it so that only authenticated users can create paragraphs,
// in which case use 'callable functions'
// (For more details, see: https://stackoverflow.com/a/56837672/19905038)
// May need to create firebase function inside say-it-right project
// Then initialize the app with it (along with auth / firestore)

export default async function (words: string[]) {
  try {
    const url = import.meta.env.VITE_PARAGRAPH_GENERATOR_ENDPOINT
    const query = words.join(', ')
    const params = { query }
    const response = await axios.get(url, { params })
    console.log(response)
    return response?.data?.choices[0]?.message?.content
  } catch (err) {
    throw new Error(`Failed to create paragraph with openAI: ${err}`)
  }
}
