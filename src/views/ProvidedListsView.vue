<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div v-if="store.inProgressLists.length" class="lists">
        <label>In Progress</label>
        <ListLinks :lists="store.inProgressLists" :routeName="'provided-list'" />
      </div>

      <div v-if="store.untouchedLists.length" class="lists">
        <hr v-if="store.inProgressLists.length" />
        <label v-if="anyListStarted">Not Started</label>
        <ListLinks :lists="store.untouchedLists" :routeName="'provided-list'" />
      </div>

      <div v-if="store.completedLists.length" class="lists">
        <hr v-if="store.inProgressLists.length || store.untouchedLists.length" />
        <label>Completed</label>
        <ListLinks :lists="store.completedLists" :routeName="'provided-list'" />
      </div>

      <!-- <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" :key="$route.fullPath"></component>
      </keep-alive>
    </router-view> -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
import { computed, onMounted } from 'vue'
import ListLinks from '@/components/ListLinks.vue'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const store = useProvidedListsStore()

const anyListStarted = computed(() => store.inProgressLists.length || store.completedLists.length)

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
hr {
  border: none;
  height: 0.5px;
  background-color: var(--vt-c-text-dark-2); // gray
}
.lists {
  display: flex;
  flex-direction: column;

  label {
    padding-bottom: 1rem;
    font-weight: 700;
  }
}

hr {
  margin: 1.5rem 0;
}
</style>
