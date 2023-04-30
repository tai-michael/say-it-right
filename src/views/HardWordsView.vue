<template>
  <main>
    <h4>Top 10 Hardest Words For Users</h4>
    <ol class="list">
      <li class="list__row" v-for="(entry, index) in leaderboard" :key="index">
        <!-- {{ entry.word }}: {{ entry.count }} -->
        {{ entry.word }}
      </li>
    </ol>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '@/firebaseInit'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const leaderboard = ref()

onMounted(async () => {
  // Get a reference to the hard_word_counts collection
  const wordCountsRef = collection(db, 'hard_word_counts')

  // Retrieve the top 10 hard words
  const q = query(wordCountsRef, orderBy('count', 'desc'), limit(10))
  const topHardWords = await getDocs(q)

  leaderboard.value = topHardWords.docs.map((doc) => ({
    word: doc.id,
    count: doc.data().count
  }))

  // // Iterate over the documents and display the word and query count
  // topHardWords.value.forEach((doc) => {
  //   const word = doc.id
  //   const count = doc.data().count
  //   console.log(`${word}: ${count}`)
  // })
})
</script>

<style lang="scss" scoped>
main {
  padding-bottom: 7rem;
}

h4 {
  margin-bottom: 1rem;
}

ol {
  list-style: none;
  padding-inline-start: 0;
  counter-reset: leaderboard;
  font-size: 16px;
}
li {
  counter-increment: leaderboard;
  margin-bottom: 14px; /* Increase the gap between rows */
}
li::before {
  content: counter(leaderboard) '. ';
  font-weight: bold;
  color: #333;
}
</style>
