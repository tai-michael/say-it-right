import { openai, defaultOptions } from '@/openaiInit.ts'

export default async function useCreateOpenAiParagraph(
  words: string[],
  apiOptions = defaultOptions
) {
  console.log('Performing api call with openapi')
  const completion = await openai.createChatCompletion({
    messages: [
      {
        role: 'user',
        content: `Write a short paragraph no more than 80 words total about a random person or subject. Make sure to write the name of the person in the first sentence. Keep the language simple, but include all of the following words in the paragraph:
        "${words.join(', ')}"

        Use these words exactly as they appear in the list; do not change the word forms. For example, do not change a noun to an adjective, or present tense to past tense. Also, use each word just once in the entire paragraph.`
      }
    ],
    ...apiOptions
  })
  console.log(completion?.data?.choices[0]?.message?.content)
  return completion?.data?.choices[0]?.message?.content
}

// export default async function useCreateOpenAiParagraph(params = {}) {
//   const DEFAULT_PARAMS = {
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'user', content: 'Hello World' }],
//     // max_tokens: 4096,
//     temperature: 0
//     // frequency_penalty: 1.0,
//     // stream: true,
//   }
//   const params_ = { ...DEFAULT_PARAMS, ...params }
//   const result = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: 'Bearer ' + String(import.meta.env.VITE_OPENAI_API_KEY)
//     },
//     body: JSON.stringify(params_)
//   })
//   // const stream = result.body
//   console.log(result)
//   // const output = await fetchStream(stream);
//   // setChatList(previousInputs => (previousInputs.concat(output.choices[0].message)));
// }
