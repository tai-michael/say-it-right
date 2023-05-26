<template>
  <ion-app>
    <ion-content class="ion-padding">
      <div
        v-if="fetchingBackendData"
        class="tw-flex tw-justify-center tw-items-center tw-min-h-screen"
      >
        <LoadingSpinner />
      </div>
      <div v-else>
        <ion-router-outlet></ion-router-outlet>
        <div v-if="!signedIn">(Sign up or Intro display/message)</div>
      </div>
    </ion-content>
  </ion-app>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, provide, watch, watchEffect } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import DarkModeToggle from './components/DarkModeToggle.vue'
import { useLocalStorage } from '@vueuse/core'
import { IonApp, IonContent, IonRouterOutlet } from '@ionic/vue'
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

const route = useRoute()
const router = useRouter()
const routeTitle = ref(route.meta.title || 'Custom Lists')
const activeListNum = computed(
  () => customListsStore?.activeList?.listNumber || providedListsStore?.activeList?.listNumber || ''
)
// const getLinkClass = (path: string) => {
//   const route = useRoute()
//   return route.path.startsWith(path) ? 'router-link-exact-active' : ''
// }

const fetchingBackendData = ref(false)
const signedIn = ref(false)

const isDarkModeEnabled = useLocalStorage('dark-mode', false)
provide('isDarkModeEnabled', isDarkModeEnabled)

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
      signedIn.value = true
    } catch (err) {
      console.error(`Failed to get user data from firestore: ${err}`)
      fetchingBackendData.value = false
    }
  }
  if (isDarkModeEnabled.value) {
    document.body.classList.add('dark')
  }
})
</script>

<style scoped>
/* #container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
} */

/* header {
  line-height: 1.5;
  max-height: 100vh;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-content {
  width: 100%;
}

.signout-btn:hover {
  cursor: pointer;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 16px;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 0.8rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
