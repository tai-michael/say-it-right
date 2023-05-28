<template>
  <ion-page>
    <TheHeader>Provided Lists</TheHeader>

    <ion-content class="ion-padding">
      <ListCategories :route-name="route.name" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import ListCategories from '@/components/ListCategories.vue'
import { IonContent, IonPage } from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  // check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // redirect to error component
    console.log(route.params)
    router.push('/not-found')
  }
})
</script>

<style lang="scss" scoped>
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
