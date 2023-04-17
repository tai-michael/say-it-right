<template>
  <header>
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->

    <div class="wrapper">
      <div style="margin-bottom: 0.7rem">
        <div v-if="isAuthenticated">
          <span style="margin-right: 1rem">Welcome, {{ user.displayName }}</span>
          <button @click="authStore.signOutUser">Sign Out</button>

          <!-- TODO for testing purposes only; remove before production -->
          <br />
          <div style="display: flex; column-gap: 0.5rem; margin-top: 0.5rem">
            <button @click="authStore.resetAllLists">Reset all</button>
            <button @click="authStore.resetCustomLists">Reset Custom lists</button>
            <button @click="authStore.resetProvidedLists">Reset Provided lists</button>
          </div>
        </div>
        <div v-else>
          <button @click="authStore.signInUser">Sign In with Google</button>
        </div>
      </div>
      <HelloWorld msg="Say It Right" @click="router.push({ name: 'home' })" />
      <nav>
        <!-- <RouterLink to="/">CustomLists</RouterLink> -->
        <RouterLink :to="{ name: 'custom-lists' }" :class="getLinkClass('/custom-lists')"
          >Custom Lists</RouterLink
        >
        <RouterLink :to="{ name: 'provided-lists' }" :class="getLinkClass('/provided-lists')"
          >Provided Lists</RouterLink
        >
        <RouterLink to="/overview">Overview</RouterLink>
      </nav>
    </div>
  </header>

  <div v-if="backendDataFetched">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" :key="$route.fullPath"></component>
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { db, isAuthenticated, user } from '@/firebaseInit'
import { doc, getDoc } from 'firebase/firestore'
import { useAuthStore, useCustomListsStore, useProvidedListsStore } from '@/stores'

const authStore = useAuthStore()
const customListsStore = useCustomListsStore()
const providedListsStore = useProvidedListsStore()

const router = useRouter()

const getLinkClass = (path) => {
  const route = useRoute()
  return route.path.startsWith(path) ? 'router-link-exact-active' : ''
}

const backendDataFetched = ref(false)

const fetchBackendData = async () => {
  const docRef = doc(db, 'users', user.value.uid)
  const docSnap = await getDoc(docRef)
  console.log(docSnap.data())

  customListsStore.allLists = docSnap.data().customLists
  providedListsStore.allLists = docSnap.data().providedLists

  console.log('Fetched user data from firestore')
}

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      // commit('TOGGLE_BOOKMARKS_SPINNER', true)
      await fetchBackendData()
      backendDataFetched.value = true
      // commit('TOGGLE_BOOKMARKS_SPINNER', false)
    } catch (err) {
      console.error(`Failed to get user data from firestore: ${err}`)
      // commit('TOGGLE_BOOKMARKS_SPINNER', false)
    }
  }
})
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
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
}
</style>
