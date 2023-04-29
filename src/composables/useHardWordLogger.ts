import { db } from '@/firebaseInit'
import { doc, runTransaction, increment } from 'firebase/firestore'

export default function useHardWordLogger(word: string) {
  const wordRef = doc(db, 'hard_word_counts', word)

  // Updates the count field of the skipped word
  runTransaction(db, async (transaction) => {
    const docSnapshot = await transaction.get(wordRef)
    if (docSnapshot.exists()) {
      transaction.update(wordRef, { count: increment(1) })
    } else {
      transaction.set(wordRef, { count: 1 })
    }
  })
}
