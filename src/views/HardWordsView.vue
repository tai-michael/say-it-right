<template>
  <ion-page>
    <TheHeader>The Hardest Words</TheHeader>
    <ion-content class="ion-padding">
      <ol class="list">
        <li class="list__row" v-for="(entry, index) in leaderboard" :key="index">
          <!-- {{ entry.word }}: {{ entry.count }} -->
          <span>{{ entry.word }}</span>
        </li>
      </ol>
      <p class="m-5">These are the top 10 hardest words for users based on user data</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import { IonPage, IonContent } from '@ionic/vue'
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
}

.list__row {
  padding: 0 10px;

  span {
    font-weight: bold;
    color: #0daf28;
  }
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
  // font-weight: bold;
  color: #838383;
}
</style>
