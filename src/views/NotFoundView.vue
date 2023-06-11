<template>
  <ion-page class="ion-padding">
    <main>
      <div class="flex align-baseline justify-baseline gap-x-2">
        <ion-icon :icon="sadOutline" class="text-5xl" />
        <span class="title">404 ERROR</span>
      </div>
      <span class="text-center"
        >Oops! It looks like this page doesn't exist anymore or your link is wrong.
      </span>
      <HomeButton />
    </main>
  </ion-page>
</template>

<script setup lang="ts">
import HomeButton from '@/components/HomeButton.vue'
import { IonPage } from '@ionic/vue'
import { IonIcon } from '@ionic/vue'
import { sadOutline } from 'ionicons/icons'
</script>

<style scoped>
main {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 34px;
  display: flex;
  align-items: end;
}

span {
  font-size: 18px;
}

body.dark span {
  color: rgb(196, 196, 196);
}
</style>
