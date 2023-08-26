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
      <ion-router-outlet
        :animated="!isWidescreenOrSafari"
        :animation="customAnimation"
      ></ion-router-outlet>

      <ion-tab-bar>
        <ion-tab-button tab="custom-list" :href="customListsPath">
          <ion-icon :icon="createOutline" />
          <ion-label> {{ $t('custom_lists.heading') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="provided-lists" :href="providedListsPath">
          <ion-icon :icon="folderOutline" />
          <ion-label>{{ $t('premade_lists.heading') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="review" href="/review" v-if="reviewStore.allWords.length > 0">
          <ion-icon :icon="timeOutline" />
          <ion-label>{{ $t('review.heading') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="hard-words" href="/hard-words">
          <ion-icon :icon="trophyOutline" />
          <ion-label>{{ $t('hard_words.heading') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
      <!-- <RouterLink to="/custom-lists" :class="getLinkClass('/custom-lists')"
          >Custom Lists</RouterLink
        >
        <RouterLink to="/provided-lists" :class="getLinkClass('/provided-lists')"
          >Provided Lists</RouterLink
        >
        <RouterLink to="/review">Review</RouterLink>
        <RouterLink to="/hard-words">Hard Words</RouterLink>
        <RouterLink v-if="authStore.signedInAsAdmin" to="/admin">Admin</RouterLink> -->
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, watch, watchEffect, onMounted } from 'vue'
import { customEnterAnimation } from '@/components/transitions/CustomEnterAnimation'
import { customLeaveAnimation } from '@/components/transitions/CustomLeaveAnimation'
import { createOutline, folderOutline, timeOutline, trophyOutline } from 'ionicons/icons'
import {
  IonPage,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon
} from '@ionic/vue'
import useSafariDetector from '@/composables/useSafariDetector'
import { useCustomListsStore, useProvidedListsStore, useReviewStore } from '@/stores/index.ts'
import { useRoute } from 'vue-router'

const route = useRoute()
const customListsStore = useCustomListsStore()
const providedListsStore = useProvidedListsStore()
const reviewStore = useReviewStore()

const customListsPath = computed(() => {
  const id = customListsStore.activeId
  return id ? `/custom-lists/${id}` : '/custom-lists'
})

const providedListsPath = computed(() => {
  const id = providedListsStore.activeId
  return id ? `/provided-lists/${id}` : '/provided-lists'
})

// NOTE Safari already has its own native animations
const { isSafari } = useSafariDetector()
const isWidescreen = window.matchMedia('(min-width: 640px)').matches
const isWidescreenOrSafari = isWidescreen || isSafari.value

const customAnimation = computed(() => {
  return route.name === 'custom-list' || route.name === 'provided-list'
    ? customLeaveAnimation
    : customEnterAnimation
})

onMounted(() => {
  if (isWidescreenOrSafari)
    watchEffect(() => {
      // Used to highlight the active tab correctly after browser back used
      return watch(
        () => route.name,
        (newValue) => {
          if (newValue === 'custom-lists' && customListsStore.activeId)
            customListsStore.setActiveId(null)

          if (newValue === 'provided-lists' && providedListsStore.activeId)
            providedListsStore.setActiveId(null)
        }
      )
    })
})
</script>

<style lang="scss" scoped>
// ion-tabs,
// ion-router-outlet {
//   max-height: 100vh;
// }

ion-tab-bar {
  // --background: rgb(231, 253, 243);
  // --background: #b9e5e1;
  --background: #dcf2f0;

  @media only screen and (min-width: 768px) {
    margin-top: 56px;
    position: absolute;
    justify-content: start;
    width: 7rem;
    height: 100vh;
    flex-direction: column;
    border-right: 1px rgb(206, 206, 206) solid;

    ion-tab-button {
      max-height: 85px;
      min-width: 85px;
    }

    ion-icon {
      font-size: 1.75rem;
    }
  }
}

// ion-router-outlet {
//   margin-left: 7rem;
// }

body.dark ion-tab-bar {
  --background: rgb(24, 24, 24);
  border-top: 1px rgb(43, 43, 43) solid;

  @media only screen and (min-width: 768px) {
    border-right: 1px rgb(43, 43, 43) solid;
  }
}
</style>
