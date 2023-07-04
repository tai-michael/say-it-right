<template>
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh()" v-if="isAtTop">
    <ion-refresher-content class="refresher-content"></ion-refresher-content>
  </ion-refresher>
  <div ref="refreshTrigger"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { IonRefresher, IonRefresherContent } from '@ionic/vue'
const isAtTop = ref(false)
const refreshTrigger = ref<HTMLElement | null>(null)
const observerTop = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    isAtTop.value = entry.isIntersecting
    // console.log('isAtTop:', isAtTop.value)
  })
})

const handleRefresh = () => {
  location.reload()
}

onMounted(() => {
  if (refreshTrigger.value !== null) observerTop.observe(refreshTrigger.value)
})

onUnmounted(() => {
  observerTop.disconnect()
})
</script>
<style lang="scss" scoped>
ion-refresher {
  overscroll-behavior: none !important;
  position: absolute !important;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  // z-index: 9999999 !important;
  // overflow: hidden !important;
}
</style>
