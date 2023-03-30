<template>
  <main>
    <div>Word Test</div>
    <div>{{ store.mispronouncedTestedWords[0] }}</div>
    <button @click="store.wordTestCompleted = true">Next</button>
  </main>
</template>

<script setup>
import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()
</script>
