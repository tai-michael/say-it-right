<template>
  <ion-refresher
    slot="fixed"
    :scroll-y="false"
    :force-overscroll="false"
    @ionRefresh="handleRefresh()"
    v-if="isAtTop"
  >
    <ion-refresher-content
      :scroll-y="false"
      :force-overscroll="false"
      slot="fixed"
      class="refresher-content"
      no-bounce
      has-bouncing="false"
    ></ion-refresher-content>
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
.refresher-content {
  -webkit-overflow-scrolling: auto !important;
}
</style>
