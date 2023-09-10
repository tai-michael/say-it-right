<template>
  <!-- <ion-page v-if="!tabMounted">Loading...</ion-page> -->
  <ion-page v-if="tabMounted">
    <TheHeader>{{ $t('premade_lists.heading') }}</TheHeader>

    <ion-content class="ion-padding" ref="content" :force-overscroll="false">
      <PullRefresher />
      <div ref="scrollTrigger" class="scroll-trigger"></div>
      <!-- NOTE don't use 'route.name', as it can cause bugs from navigation/redirects -->
      <ListGroups :route-name="'premade-lists'" />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end">
      <ion-fab-button @click="scrollToTop" aria-label="Scroll to top" v-if="isVisible">
        <ion-icon :icon="arrowUp"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>

  <ion-page v-else class="max-h-[100vh]">
    <TheHeader>{{ $t('premade_lists.heading') }}</TheHeader>
    <ion-content>
      <LoadingSpinner />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
const ListGroups = defineAsyncComponent(() => import('@/components/ListGroups.vue'))
import {
  IonPage,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  onIonViewDidEnter,
  onIonViewWillLeave
} from '@ionic/vue'
import { arrowUp } from 'ionicons/icons'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isVisible = ref(false)
const scrollTrigger = ref<HTMLElement | null>(null)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    isVisible.value = !entry.isIntersecting
  })
})

const content = ref<HTMLElement | null>(null)
const scrollToTop = () => {
  // @ts-ignore
  if (content.value) content.value.$el.scrollToTop(500)
}

const tabMounted = ref(false)
onMounted(() => {
  // Check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // Redirect to error component
    console.log(route.params)
    router.push('/not-found')
  }

  // console.log('Premade Lists mounted')
  setTimeout(() => {
    tabMounted.value = true

    // Preloading these components reduces delay when ListCard is clicked;
    // Tested on iOS, Android, and desktop
    import('@/components/WordChallenge.vue')
    import('@/components/ParagraphChallenge.vue')
    import('@/components/ListContent.vue')
  }, 500)
})

// // NOTE regular vue 3 onActivated, deactivated, and beforeRouteUpdate seemingly don't work with either ionic's router outlet or its tabs, though they do with modals
onIonViewDidEnter(() => {
  // setTimeout is necessary to prevent fab from showing before the ref element ('scrollTrigger') is mounted
  setTimeout(() => {
    if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)
  }, 600)
})

onIonViewWillLeave(() => {
  observer.disconnect()
})
</script>

<style lang="scss" scoped>
ion-content {
  --background: #eef9f8;

  @media only screen and (min-width: 481px) {
    --padding-start: 3rem;
    --padding-end: 3rem;
  }

  @media only screen and (min-width: 768px) {
    --padding-start: 8rem;
    --padding-end: 1rem;
  }
}

.scroll-trigger {
  height: 800px;
  position: absolute;
  visibility: hidden;

  // @media (min-width: 1024px) {
  //   height: 800px;
  // }
}

body.dark {
  ion-content {
    --background: rgb(32, 32, 32);
  }
}

// hr {
//   border: none;
//   height: 0.5px;
//   background-color: var(--vt-c-text-dark-2); // gray
//   margin: 1.5rem 0;
// }
// .lists {
//   display: flex;
//   flex-direction: column;

//   label {
//     padding-bottom: 1rem;
//     font-weight: 600;
//   }
// }
</style>
