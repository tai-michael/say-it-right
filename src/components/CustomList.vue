<template>
  <ion-page>
    <ListContent :list="list" route-name="custom-lists" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import type { List } from '@/stores/modules/types/List'
import ListContent from '@/components/ListContent.vue'
import {
  IonPage,
  useIonRouter,
  onIonViewWillEnter,
  onIonViewWillLeave // maybe replace history so that it goes to premade lists view? and do similar for all tabs*
} from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomListsStore } from '@/stores/index.ts'

const route = useRoute()
const router = useRouter()
const ionRouter = useIonRouter()
const store = useCustomListsStore()
// const componentKey = 'custom-list'

// @ts-ignore
const list = ref<List>({})

const listEntered = ref()
provide('listEntered', listEntered)

// NOTE need to use this instead of onMounted, as the latter only triggers once, meaning if user navigates with back button to custom lists view, the activeId for the instance will be set to null and never change again
onIonViewWillEnter(() => {
  if (route.params.id) {
    if (!Object.keys(list.value).length) {
      if (store.activeList) {
        // NOTE creates direct reactive store reference to the list so that computed properties wouldn't have to rerender needlessly when user navigates to a different view. Update: might not be applicable anymore.
        // const listNum = store.activeList.listNumber
        // list.value = store.allLists[listNum - 1]
        list.value = store.activeList
      } else {
        // ion router allows custom animation for router push
        ionRouter.navigate('/not-found', 'none', 'push')
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

  listEntered.value = true
  // console.log(listEntered.value)
})

onIonViewWillLeave(() => {
  listEntered.value = false
  // console.log(listEntered.value)
})
</script>
