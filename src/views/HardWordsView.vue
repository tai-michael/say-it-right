<template>
  <ion-page>
    <TheHeader>The Hardest Words</TheHeader>
    <ion-content>
      <PullRefresher />

      <div v-if="tabMounted" class="h-full flex flex-col align-middle items-center">
        <ion-label class="m-5 ion-padding leading-6 sm:mt-8 sm:mb-7"
          >Top 10 hardest words based on data collected from users:</ion-label
        >
        <ion-card
          v-if="leaderboard"
          class="m-0 pt-3 pb-1 pl-2 pr-2 sm:pt-10 sm:pb-8 sm:pl-12 sm:pr-12"
        >
          <ol class="list">
            <li class="list__row" v-for="(entry, index) in leaderboard" :key="index">
              <!-- {{ entry.word }}: {{ entry.count }} -->
              <span>{{ entry.word }}</span>
            </li>
          </ol>
        </ion-card>
      </div>

      <LoadingSpinner v-else />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
import { IonPage, IonContent, IonLabel, IonCard } from '@ionic/vue'
import { db } from '@/firebaseInit'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const leaderboard = ref()

const tabMounted = ref(false)
onMounted(async () => {
  // console.log('Hard Words mounted')
  setTimeout(() => {
    tabMounted.value = true
  }, 500)

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
// main {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// }

ion-content {
  @media only screen and (min-width: 768px) {
    --padding-start: 8rem;
  }
}

ion-label {
  // font-weight: 600;
  color: rgb(80, 80, 80);
}

.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 15px;

  @media only screen and (min-width: 768px) {
    grid-gap: 30px;
  }
}

.list__row {
  padding: 0 10px;

  @media only screen and (min-width: 768px) {
    padding: 4px 20px;
  }

  span {
    // font-weight: 500;
    // color: #287671;
    color: rgb(80, 80, 80);
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

body.dark {
  ion-label {
    // font-weight: 600;
    color: rgb(196, 196, 196);
  }

  .list__row {
    span {
      color: rgb(196, 196, 196);
    }
  }

  ion-card {
    --background: rgb(42, 42, 42);
    --color: rgb(196, 196, 196);
  }
}
</style>
