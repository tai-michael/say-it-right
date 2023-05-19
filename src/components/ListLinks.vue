<template>
  <main>
    <div v-for="list of props.lists" :key="list.listNumber">
      <RouterLink
        :to="{ name: props.routeName, params: { id: list.listNumber } }"
        class="list-link"
      >
        <div class="list-link-content">
          <span>List {{ list.listNumber }}</span>
          <ListChecked v-if="list.status === 'LIST_COMPLETE'" />
          <ListRegular v-else />
        </div>
      </RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import ListChecked from '@/assets/icons/list-checked.vue'
import ListRegular from '@/assets/icons/list-regular.vue'

const props = defineProps({
  lists: { type: Array as PropType<List[]>, required: true },
  routeName: { type: String, required: true }
})
</script>

<style lang="scss" scoped>
main {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem 2rem; // row-gap, column-gap
  // list-style: none;
  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, 1fr);
  }
}

.list-link {
  color: inherit;
}
.list-link:hover {
  // background-color: transparent;
  color: white;
}

.list-link-content {
  display: flex;
  flex-direction: column;
}
</style>
