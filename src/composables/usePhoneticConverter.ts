import { useIpaDictionaryStore } from '@/stores'
import { metaphone } from 'metaphone'
// import { ipaDictionary } from '@/assets/ipa_dict'

// NOTE Allows us to get the Phonetic code of a word
// Useful in case a correctly pronounced word is mistranscribed
// Also helps if there's an accented word in the paragraph (e.g. café)
export default function (word: string) {
  // const module = await import('@/assets/ipa_dict')
  // const ipaDictionary = module.ipaDictionary

  const store = useIpaDictionaryStore()
  // For testing purposes, 'sanjo' is not in the IPA dictionary
  const phoneticCode = store.ipaDictionary?.[word] ? store.ipaDictionary[word] : metaphone(word)

  return phoneticCode
}
