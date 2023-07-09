<template>
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh()" v-show="isAtTop">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>

  <div
    ref="refreshTrigger"
    slot="fixed"
    :overflow-scroll="false"
    no-bounce
    :has-bouncing="false"
    :scroll-y="false"
    :force-overscroll="false"
    class="trigger"
  ></div>
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
ion-refresher,
ion-refresher-content,
.trigger {
  scroll-snap-type: none !important;
}

.trigger {
  position: absolute;
  overflow: hidden !important;
}
</style>
