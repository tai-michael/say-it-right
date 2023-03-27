import { openai, defaultOptions } from '@/openaiInit.js'

export default async function useCreateOpenAiParagraph(wordsList, apiOptions = defaultOptions) {
  console.log('Performing api call with openapi')
  const completion = await openai.createChatCompletion({
    messages: [
      {
        role: 'user',
        content: `Write a short paragraph no more than 80 words total about a random person or subject. Make sure to write the name of the person in the first sentence. Keep the language simple, but include all of the following words in the paragraph:
        "${wordsList.join(', ')}"

        Use these words exactly as they appear in the list; do not change the word forms. For example, do not change a noun to an adjective, or present tense to past tense. Also, use each word just once in the entire paragraph.`
      }
    ],
    ...apiOptions
  })
  console.log(completion.data.choices[0].message.content)
  return completion.data.choices[0].message.content
}
