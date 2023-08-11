<template>
  <PullRefresher />
  <div class="text-center">
    <div class="mt-20 mb-10 text-3xl flex justify-center gap-3 items-end logo">
      <img :src="logo" class="w-11 h-11" /> Say It Right
    </div>
  </div>
  <FirebaseUI />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
const FirebaseUI = defineAsyncComponent(() => import('@/components/FirebaseUI.vue'))
const logo = new URL('@/assets/images/logo-dark.png', import.meta.url).href
</script>

<style lang="scss">
ion-content {
  --background: #eef9f8;
}

body.dark {
  ion-content {
    --background: rgb(32, 32, 32);
  }
}

.logo {
  color: #25c7b1;
}
</style>
