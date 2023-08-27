<template>
  <ion-page class="ion-padding">
    <ion-content>
      <PullRefresher />
      <main>
        <div class="flex align-baseline justify-baseline gap-x-2">
          <ion-icon :icon="sadOutline" class="text-5xl" />
          <span class="title">{{ $t('not_found.title') }}</span>
        </div>
        <span class="mr-4 ml-4">{{ $t('not_found.introduction') }} </span>
        <HomeButton />
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
import HomeButton from '@/components/HomeButton.vue'
import { IonPage, IonContent } from '@ionic/vue'
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
