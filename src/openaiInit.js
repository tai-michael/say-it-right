import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})
// const openai = new OpenAIApi(configuration)
export const openai = new OpenAIApi(configuration)

// const completion = await openai.createChatCompletion({
//   model: 'gpt-3.5-turbo',
//   messages: [{ role: 'user', content: 'Hello world' }]
// })
// console.log(completion.data.choices[0].message)
