<template>
  <h4>Word Review</h4>
  <main>
    <ul class="list">
      <li class="list__row" v-for="(entry, index) in allWords" :key="index">
        <!-- TODO replace with router-link -->
        {{ entry.word }}
      </li>
    </ul>
    <hr />
    <!-- TODO replace with SingleWordChallenge -->
    <div class="content">(SingleWordChallenge)</div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { WordObject } from '@/stores/modules/types/Review'
import { useWordReviewStore } from '@/stores/index.ts'

const store = useWordReviewStore()

const allWords = ref<WordObject[]>([])

// REVIEW or use computed
onMounted(() => {
  allWords.value = [...store.allWords]
})
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: row;
}
h4 {
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}
.list {
  padding: 0.5rem 1rem;
  li {
    list-style: none;
  }
  max-height: 250px;
  overflow-y: auto;
}
.content {
  padding: 0.5rem 1rem;
}
</style>
