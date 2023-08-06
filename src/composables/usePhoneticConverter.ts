import { ipaDictionary } from '@/assets/ipa_dict'
import { metaphone } from 'metaphone'

// NOTE Allows us to get the Phonetic code of a word
// Useful in case a correctly pronounced word is mistranscribed
// Also helps if there's an accented word in the paragraph (e.g. café)
export default function (word: string) {
  // For testing purposes, 'sanjo' is not in the IPA dictionary
  return ipaDictionary[word] ? ipaDictionary[word] : metaphone(word)
}
