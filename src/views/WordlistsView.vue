<template>
  <main>
    <div v-for="list of store.partiallyTestedLists" :key="list.listNumber">
      {{ list.listNumber }}
    </div>
    <hr />
    <div v-for="list of store.untestedLists" :key="list.listNumber">
      {{ list.listNumber }}
    </div>
    <hr />
    <div v-for="list of store.completedLists" :key="list.listNumber">
      {{ list.listNumber }}
    </div>
  </main>
</template>

<script setup>
import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()

// store.partiallyTestedLists,
// store.untestedLists,
// store.completedLists,
</script>

<style lang="scss" scoped></style>
