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
      <ion-router-outlet></ion-router-outlet>
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
        <ion-tab-button tab="custom-list" href="/custom-lists">
          <ion-icon :icon="playCircle" />
          <ion-label>Custom Lists</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="provided-lists" href="/provided-lists">
          <ion-icon :icon="radio" />
          <ion-label>Provided Lists</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="review" href="/review">
          <ion-icon :icon="library" />
          <ion-label>Review</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="hard-words" href="/hard-words">
          <ion-icon :icon="search" />
          <ion-label>Hard Words</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, watchEffect } from 'vue'
import {
  IonPage,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon
} from '@ionic/vue'
import { playCircle, radio, library, search } from 'ionicons/icons'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { db, isAuthenticated, user } from '@/firebaseInit'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  useAuthStore,
  useCustomListsStore,
  useProvidedListsStore,
  useReviewStore
} from '@/stores/index.ts'

const authStore = useAuthStore()
const customListsStore = useCustomListsStore()
const providedListsStore = useProvidedListsStore()
const reviewStore = useReviewStore()

const router = useRouter()

// const getLinkClass = (path: string) => {
//   const route = useRoute()
//   return route.path.startsWith(path) ? 'router-link-exact-active' : ''
// }

const fetchingBackendData = ref(false)
const backendDataFetched = ref(false)

const globalListsQuery = computed(() => collection(db, 'global_provided_lists'))
const globalLists = useFirestore(globalListsQuery)

const fetchBackendData = async () => {
  try {
    if (!user.value) throw new Error('User not defined')

    const usersDocRef = doc(db, 'users', user.value.uid)
    let userDocSnap = await getDoc(usersDocRef)
    const userProvidedList = ref(userDocSnap.data()?.providedLists)
    console.log('Fetched user data from firestore')
    // console.log(userDocSnap.data())

    // NOTE adds any new lists to backend user lists when App starts
    if (globalLists.value && globalLists.value.length > userProvidedList.value.length) {
      const newLists = extractNewLists(globalLists.value, userProvidedList.value)

      const newProvidedLists = [...userProvidedList.value, ...newLists]
      console.log(newProvidedLists)

      await updateDoc(usersDocRef, {
        providedLists: newProvidedLists
      })

      userDocSnap = await getDoc(usersDocRef)
    }

    customListsStore.setLists(userDocSnap.data()?.customLists)
    providedListsStore.setLists(userDocSnap.data()?.providedLists)
    reviewStore.setWords(userDocSnap.data()?.review)

    // NOTE triggers watcher after allLists has been hydrated
    // Adds a new list whenever a new global list is added
    watchEffect(() => {
      addWatcherForGlobalProvidedLists()
    })
  } catch (err) {
    throw err
  }
}

const addWatcherForGlobalProvidedLists = () => {
  // NOTE 'return' returns the cleanup function for the watcher
  return watch(globalLists, (newVal) => {
    console.log('watcher triggered')

    if (newVal && newVal.length <= providedListsStore.allLists.length) return

    // NOTE adds new list(s) to store
    const newLists = extractNewLists(newVal, providedListsStore.allLists)

    // TODO add delete new list(s) ability
    // Can be something like (if oldVal.length > newVal.length) map the listNumbers to array, compare the
    // arrays, and find the list that was deleted
    // then delete that list from user's provided list
    // in firestore.

    providedListsStore.allLists.push(...newLists)
    providedListsStore.updateListsInFirestore()
    // console.log(providedListsStore.allLists)
  })
}

// @ts-ignore
const extractNewLists = (newArray, oldArray) => {
  const newItems = []

  for (let i = oldArray.length; i < newArray.length; i++) {
    const newItem = JSON.parse(JSON.stringify(newArray[i]))
    newItems.push(newItem)
  }

  return newItems
}

// if (newVal && newVal.length > providedListsStore.allLists.length) {
//   for (let i = providedListsStore.allLists.length; i < newVal.length; i++) {
//     const newList = JSON.parse(JSON.stringify(newVal[i]))
//     // providedListsStore.allLists.push(newList)
//     console.log(newList)
//     // console.log('pushed new list to allLists')
//   }
//   // console.log(providedListsStore.allLists)
// }

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      fetchingBackendData.value = true
      await fetchBackendData()
      fetchingBackendData.value = false
      backendDataFetched.value = true
    } catch (err) {
      console.error(`Failed to get user data from firestore: ${err}`)
      fetchingBackendData.value = false
    }
  }
})
</script>

<style scoped></style>
