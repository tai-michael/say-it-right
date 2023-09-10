<template>
  <ion-app>
    <div id="modals"></div>
    <ion-content class="ion-padding">
      <LoadingSpinner v-if="fetchingBackendData" />
      <ion-router-outlet v-else-if="signedIn"></ion-router-outlet>
      <SignInView v-else-if="!user" />
    </ion-content>
  </ion-app>
</template>

<script setup lang="ts">
import { computed, ref, provide, watch, watchEffect, nextTick, onMounted } from 'vue'
import SignInView from '@/views/SignInView.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useLocalStorage } from '@vueuse/core'
// import { compress, decompress } from 'lz-string'
import { IonApp, IonContent, IonRouterOutlet } from '@ionic/vue'
import { db, isAuthenticated, user, auth } from '@/firebaseInit'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import {
  useCustomListsStore,
  usePremadeListsStore,
  useReviewStore,
  useIpaDictionaryStore
} from '@/stores/index.ts'

const customListsStore = useCustomListsStore()
const premadeListsStore = usePremadeListsStore()
const reviewStore = useReviewStore()
const ipaDictionaryStore = useIpaDictionaryStore()

// const getLinkClass = (path: string) => {
//   const route = useRoute()
//   return route.path.startsWith(path) ? 'router-link-exact-active' : ''
// }

//  NOTE The dictionary is quite big (1.3MB after compression), so caching it in localStorage for reloads
let lzString
onMounted(async () => {
  lzString = await import('lz-string')
  const storedIpaDictionary = localStorage.getItem('ipaDictionary')

  let ipaDictionary
  if (storedIpaDictionary) {
    ipaDictionary = JSON.parse(lzString.decompressFromUTF16(storedIpaDictionary))
  } else {
    const module = await import('@/assets/ipa_dict')
    ipaDictionary = module.ipaDictionary
    localStorage.setItem('ipaDictionary', lzString.compressToUTF16(JSON.stringify(ipaDictionary)))
  }
  ipaDictionaryStore.hydrateDictionary(ipaDictionary)
})

const isDarkModeEnabled = useLocalStorage('dark-mode', false)
provide('isDarkModeEnabled', isDarkModeEnabled)

const globalListsQuery = computed(() => collection(db, 'global_premade_lists'))
const globalLists = useFirestore(globalListsQuery)

const signedIn = ref(false)
const fetchingBackendData = ref(false)

const fetchBackendData = async () => {
  if (!user.value) throw new Error('User not defined')

  const usersDocRef = doc(db, 'users', user.value.uid)
  let userDocSnap = await getDoc(usersDocRef)
  const userPremadeList = ref(userDocSnap.data()?.premadeLists)
  console.log('Fetched user data from firestore')
  // console.log(userDocSnap.data())

  // NOTE if it's user's first time logging in, send premade lists from backend
  if (!userPremadeList.value) {
    console.log('hydrating premade lists')
    userPremadeList.value = await premadeListsStore.downloadAndExtractGlobalPremadeLists()

    await setDoc(usersDocRef, {
      userName: user.value.displayName,
      customLists: [],
      premadeLists: userPremadeList.value,
      review: []
    })

    userDocSnap = await getDoc(usersDocRef)
  }

  // NOTE adds any new lists to backend user lists when App starts
  if (globalLists.value && globalLists.value.length > userPremadeList.value.length) {
    const newLists = extractNewLists(globalLists.value, userPremadeList.value)

    const newPremadeLists = [...userPremadeList.value, ...newLists]
    console.log(newPremadeLists)

    await updateDoc(usersDocRef, {
      premadeLists: newPremadeLists
    })

    userDocSnap = await getDoc(usersDocRef)
  }

  customListsStore.setLists(userDocSnap.data()?.customLists)
  premadeListsStore.setLists(userDocSnap.data()?.premadeLists)
  reviewStore.setWords(userDocSnap.data()?.review)

  // NOTE triggers watcher after allLists has been hydrated
  // Adds a new list whenever a new global list is added
  watchEffect(() => {
    addWatcherForGlobalPremadeLists()
  })
}

const addWatcherForGlobalPremadeLists = () => {
  // NOTE 'return' returns the cleanup function for the watcher
  return watch(globalLists, (newVal) => {
    console.log('watcher triggered')

    if (newVal && newVal.length <= premadeListsStore.allLists.length) return

    // NOTE adds new list(s) to store
    const newLists = extractNewLists(newVal, premadeListsStore.allLists)

    // TODO add delete new list(s) ability
    // Can be something like (if oldVal.length > newVal.length) map the listNumbers to array, compare the
    // arrays, and find the list that was deleted
    // then delete that list from user's premade list
    // in firestore.

    premadeListsStore.allLists.push(...newLists)
    premadeListsStore.updateListsInFirestore()
    // console.log(premadeListsStore.allLists)
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

auth.onAuthStateChanged(async () => {
  if (isDarkModeEnabled.value) {
    document.body.classList.add('dark')
  }

  if (!isAuthenticated.value) return (signedIn.value = false)

  fetchingBackendData.value = true
  await fetchBackendData()
  fetchingBackendData.value = false
  signedIn.value = true
  console.log('Fetched backend data')

  // NOTE necessary b/c of ionic bug with vue router.
  // See https://forum.ionicframework.com/t/ion-page-invisible-class-not-being-removed-navigating-in-between-pages-video/162114/10
  nextTick(() => {
    document.querySelector('div.ion-page')?.classList.remove('ion-page-invisible')

    // const nav = document.querySelector('ion-router-outlet') as HTMLIonRouterOutletElement
    // nav.swipeGesture = false
  })
})
</script>

<style lang="scss" scoped>
ion-app,
ion-content,
ion-router-outlet {
  max-height: 100vh;
}

#modals {
  z-index: 99999;
}
</style>
