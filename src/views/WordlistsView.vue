<template>
  <main>
    <div class="list-type">
      <label>In Progress</label>
      <div class="list-container">
        <div v-for="list of store.partiallyTestedLists" :key="list.listNumber">
          <router-link :to="{ name: 'suggested', params: { id: list.listNumber } }" class="list">
            <div class="list-item">
              <span>List {{ list.listNumber }}</span>
              <ListRegular />
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <hr />

    <div class="list-type">
      <label>Not Started</label>
      <div class="list-container">
        <div v-for="list of store.untestedLists" :key="list.listNumber">
          <RouterLink :to="{ name: 'suggested', params: { id: list.listNumber } }" class="list">
            <div class="list-item">
              <span>List {{ list.listNumber }}</span>
              <ListRegular />
            </div>
          </RouterLink>
        </div>
      </div>
    </div>

    <hr />

    <div class="list-type">
      <label>Completed</label>
      <div class="list-container">
        <div v-for="list of store.completelyTestedLists" :key="list.listNumber">
          <RouterLink :to="{ name: 'suggested', params: { id: list.listNumber } }" class="list">
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

<script setup>
import ListChecked from '@/assets/images/list-checked.vue'
import ListRegular from '@/assets/images/list-regular.vue'

import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()
</script>

<style lang="scss" scoped>
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
