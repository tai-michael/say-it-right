<template>
  <ion-header>
    <ion-toolbar>
      <slot name="list"></slot>
      <button
        v-if="props.showBackButton"
        @click="$emit('back-button-clicked')"
        router-direction="back"
        :router-animation="customLeaveAnimation"
        slot="start"
      >
        <ion-icon :icon="arrowBack"></ion-icon>
      </button>
      <ion-title><slot></slot></ion-title>
      <!-- <ion-title><slot name="title">Default Title</slot></ion-title> -->
      <DarkModeToggle slot="end" />
      <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
    </ion-toolbar>
  </ion-header>
</template>
<script setup lang="ts">
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { customLeaveAnimation } from '@/components/transitions/CustomLeaveAnimation'
import { IonHeader, IonToolbar, IonTitle, IonIcon, IonProgressBar } from '@ionic/vue'
import { arrowBack } from 'ionicons/icons'
const props = defineProps({
  showBackButton: {
    type: Boolean
  },
  isLoading: {
    type: Boolean
  }
})
</script>
<style lang="scss" scoped>
ion-toolbar {
  display: flex;
  max-height: 44px;
  padding: 0 0.2rem;
}
button {
  display: flex;
  padding: 0 0.3rem;

  ion-icon {
    height: 24px;
    width: 24px;
  }
}
</style>
