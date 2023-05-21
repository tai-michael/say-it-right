<template>
  <ion-page>
    <h1>Oops!</h1>
    <span>The page you requested could not be found. </span>
    <HomeButton />
  </ion-page>
</template>

<script setup lang="ts">
import HomeButton from '@/components/HomeButton.vue'
import { IonPage } from '@ionic/vue'
</script>

<style scoped>
span {
  font-size: 20px;
}
</style>
