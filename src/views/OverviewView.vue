<template>
  <main>
    <div v-if="store.inProgressLists.length" class="list-type">
      <label>In Progress</label>
      <div class="list-container">
        <div v-for="list of store.inProgressLists" :key="list.listNumber">
          <router-link
            :to="{ name: 'provided-lists', params: { id: list.listNumber } }"
            class="list"
          >
            <div class="list-item">
              <span>List {{ list.listNumber }}</span>
              <ListRegular />
            </div>
          </router-link>
        </div>
      </div>
      <hr />
    </div>

    <div v-if="store.untouchedLists.length" class="list-type">
      <label v-if="anyListStarted">Not Started</label>
      <div class="list-container">
        <div v-for="list of store.untouchedLists" :key="list.listNumber">
          <RouterLink
            :to="{ name: 'provided-lists', params: { id: list.listNumber } }"
            class="list"
          >
            <div class="list-item">
              <span>List {{ list.listNumber }}</span>
              <ListRegular />
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="store.completedLists.length" class="list-type">
      <hr />
      <label>Completed</label>
      <div class="list-container">
        <div v-for="list of store.completedLists" :key="list.listNumber">
          <RouterLink
            :to="{ name: 'provided-lists', params: { id: list.listNumber } }"
            class="list"
          >
            <div class="list-item">
              <span>List {{ list.listNumber }}</span>
              <ListChecked />
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ListChecked from '@/assets/images/list-checked.vue'
import ListRegular from '@/assets/images/list-regular.vue'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const store = useProvidedListsStore()

const anyListStarted = computed(() => store.inProgressLists.length || store.completedLists.length)

onMounted(() => {
  // check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // redirect to your error component
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
.list-type {
  display: flex;
  flex-direction: column;

  label {
    padding-bottom: 1rem;
    font-weight: 700;
  }
  .list-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem 2rem; // row-gap, column-gap
    // list-style: none;

    @media (min-width: 1024px) {
      grid-template-columns: repeat(6, 1fr);
    }
    .list {
      color: inherit;
    }
    .list:hover {
      // background-color: transparent;
      color: white;
    }

    .list-item {
      display: flex;
      flex-direction: column;
    }
  }
}

hr {
  margin: 1.5rem 0;
}
</style>
