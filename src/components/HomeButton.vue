<template>
  <div>
    <button @click="router.push({ name: 'home' })">Home</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
button {
  margin-top: 1rem;
}
</style>
