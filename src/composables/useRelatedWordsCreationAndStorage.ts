import useOpenAiRelatedWordsGenerator from '@/composables/useOpenAiRelatedWordsGenerator'
import { db } from '@/firebaseInit'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default async function (word: string) {
  const documentRef = doc(db, 'related_words', word)
  const documentSnapshot = await getDoc(documentRef)

  if (documentSnapshot.exists()) {
    const relatedWords = documentSnapshot.data().relatedWords
    console.log(`existing related words retrieved: ${relatedWords}`)
    return relatedWords
  } else {
    const relatedWords = await useOpenAiRelatedWordsGenerator(word)
    console.log(`related words generated: ${relatedWords}`)
    setDoc(documentRef, { relatedWords })
    return relatedWords
  }
}
