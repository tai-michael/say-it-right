<template>
  <ion-page>
    <TheHeader>Provided Lists</TheHeader>

    <ion-content class="ion-padding" ref="content">
      <div ref="scrollTrigger" class="scroll-trigger"></div>
      <ListGroups :route-name="route.name" />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end">
      <ion-fab-button @click="scrollToTop" aria-label="Scroll to top" v-if="isVisible">
        <ion-icon :icon="arrowUp"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import ListGroups from '@/components/ListGroups.vue'
import {
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon,
  onIonViewWillEnter,
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

onMounted(() => {
  // check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // redirect to error component
    console.log(route.params)
    router.push('/not-found')
  }
})

// // NOTE regular vue 3 onActivated, deactivated, and beforeRouteUpdate seemingly don't work with either ionic's router outlet or its tabs, though they do with modals
onIonViewWillEnter(() => {
  if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)
})

onIonViewWillLeave(() => {
  observer.disconnect()
})
</script>

<style lang="scss" scoped>
.scroll-trigger {
  height: 800px;
  position: absolute;
  visibility: hidden;

  @media (min-width: 1024px) {
    height: 2400px;
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
//     font-weight: 700;
//   }
// }
</style>
