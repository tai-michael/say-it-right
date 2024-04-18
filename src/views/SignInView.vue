<template>
  <PullRefresher />
  <div class="h-full flex flex-col justify-center">
    <div class="mb-3 text-3xl flex justify-center gap-3 items-end">
      <img :src="logo" class="w-11 h-11" />
      <header class="text-[#25c7b1]">Say It Right</header>
    </div>
    <FirebaseUI />
  </div>
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
</style>
