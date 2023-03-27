import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})
// const openai = new OpenAIApi(configuration)
export const openai = new OpenAIApi(configuration)

// NOTE Only 'model' and 'messages' are required, the rest are optional. The values for the optional properties below are their default ones.
export const defaultOptions = {
  // Required
  model: 'gpt-3.5-turbo',

  // What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. Alter this or top_p but not both.
  temperature: 1,

  // An alternative to sampling with temperature.
  top_p: 1,

  // How many chat completion choices to generate for each input message.
  n: 1,

  // To get responses sooner, you can 'stream' the completion as it's being generated.
  stream: false,

  // The maximum number of tokens to generate in the chat completion. Roughly 1000 tokens is needed for 750 words.
  max_tokens: 100,

  // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
  presence_penalty: 0,

  // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
  frequency_penalty: 0
}
