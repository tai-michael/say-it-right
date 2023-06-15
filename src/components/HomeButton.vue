<template>
  <div>
    <!-- use router-link instead of router.push to set animation -->
    <ion-button router-link="/" router-direction="none"
      ><ion-icon :icon="home" class="mr-2 mb-1" />Home Page</ion-button
    >
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue'
import { IonIcon } from '@ionic/vue'
import { home } from 'ionicons/icons'
</script>

<style scoped></style>
