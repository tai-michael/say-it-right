<template>
  <div>
    <ion-button @click="router.push({ name: 'home' })">Home</ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
button {
  margin-top: 1rem;
}

button:hover {
  cursor: pointer;
}
</style>
