<template>
  <ion-page>
    <ion-tabs>
      <!-- <ion-router-outlet>
        <LoadingSpinner v-if="fetchingBackendData" />
        <div v-else-if="!fetchingBackendData && backendDataFetched" class="main-content">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" :key="$route.fullPath"></component>
            </keep-alive>
          </router-view>
        </div>
        <div v-else>(Sign up or Intro display/message)</div>
      </ion-router-outlet> -->
      <ion-router-outlet :animation="customAnimation"></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <!-- <RouterLink to="/custom-lists" :class="getLinkClass('/custom-lists')"
          >Custom Lists</RouterLink
        >
        <RouterLink to="/provided-lists" :class="getLinkClass('/provided-lists')"
          >Provided Lists</RouterLink
        >
        <RouterLink to="/review">Review</RouterLink>
        <RouterLink to="/hard-words">Hard Words</RouterLink>
        <RouterLink v-if="authStore.signedInAsAdmin" to="/admin">Admin</RouterLink> -->
        <ion-tab-button tab="custom-list" :href="customListsPath">
          <ion-icon :icon="personCircle" />
          <ion-label>Custom Lists</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="provided-lists" :href="providedListsPath">
          <ion-icon :icon="folder" />
          <ion-label>Provided Lists</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="review" href="/review" v-if="reviewStore.allWords.length > 0">
          <ion-icon :icon="time" />
          <ion-label>Review</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="hard-words" href="/hard-words">
          <ion-icon :icon="trophy" />
          <ion-label>Hard Words</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { customEnterAnimation } from '@/components/transitions/CustomEnterAnimation'
import { customLeaveAnimation } from '@/components/transitions/CustomLeaveAnimation'
import { personCircle, folder, time, trophy } from 'ionicons/icons'
import {
  IonPage,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon
} from '@ionic/vue'
import { useCustomListsStore, useProvidedListsStore, useReviewStore } from '@/stores/index.ts'
import { useRoute } from 'vue-router'

const route = useRoute()
const customListsStore = useCustomListsStore()
const providedListsStore = useProvidedListsStore()
const reviewStore = useReviewStore()

const customAnimation = computed(() =>
  route.name === 'custom-list' || route.name === 'provided-list'
    ? customLeaveAnimation
    : customEnterAnimation
)

const customListsPath = computed(() => {
  const id = customListsStore.activeId
  return id ? `/custom-lists/${id}` : '/custom-lists'
})

const providedListsPath = computed(() => {
  const id = providedListsStore.activeId
  return id ? `/provided-lists/${id}` : '/provided-lists'
})
</script>

<style lang="scss" scoped>
ion-tab-bar {
  --background: rgb(231, 253, 243);
  // --background: #b9e5e1;
  --background: #dcf2f0;
}

body.dark ion-tab-bar {
  --background: #141414;
}
</style>
