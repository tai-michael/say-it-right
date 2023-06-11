<template>
  <ListContent :list="list" route-name="custom-lists" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { List } from '@/stores/modules/types/List'
import ListContent from '@/components/ListContent.vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomListsStore } from '@/stores/index.ts'
const route = useRoute()
const router = useRouter()
const store = useCustomListsStore()
// const componentKey = 'custom-list'

// @ts-ignore
const list = ref<List>({})

// NOTE onActivated instead of onMounted, as onMounted doesn't trigger for keep-alive components
onMounted(() => {
  if (route.params.id) {
    if (!Object.keys(list.value).length) {
      if (store.activeList) {
        // NOTE creates direct reactive store reference to the list so that computed properties wouldn't have to rerender needlessly when user navigates to a different view. Update: might not be applicable anymore.
        // const listNum = store.activeList.listNumber
        // list.value = store.allLists[listNum - 1]
        list.value = store.activeList
      } else {
        // router.push('/custom-lists')
        router.push('/not-found')
        return
      }
    }
    store.setActiveId(+route.params.id)
    // TODO see whether the below condition is necessary
  } else if (store.activeId) {
    router.push({ params: { id: store.activeId } })
    // } else if (store.inProgressLists.length > 0) {
    //   router.push({ params: { id: store.inProgressLists[0].listNumber } })
    // } else if (store.untouchedLists.length > 0) {
    //   router.push({ params: { id: store.untouchedLists[0].listNumber } })
    // TODO re-add the below functionality somehow
    // } else {
    //   router.push('/custom-lists')
  }
})
</script>
