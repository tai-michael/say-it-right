<template>
  <div>
    <ion-button @click="router.push({ name: 'home' })"
      ><ion-icon :icon="home" class="mr-2 mb-1" />Home Page</ion-button
    >
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IonButton } from '@ionic/vue'
import { IonIcon } from '@ionic/vue'
import { home } from 'ionicons/icons'

const router = useRouter()
</script>

<style scoped></style>
