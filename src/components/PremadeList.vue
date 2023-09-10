<template>
  <ion-page>
    <ListContent :list="list" route-name="premade-lists" />
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
import { usePremadeListsStore } from '@/stores/index.ts'

const route = useRoute()
const router = useRouter()
const ionRouter = useIonRouter()
const store = usePremadeListsStore()
// const componentKey = 'premade-lists'

// @ts-ignore
const list = ref<List>({})

const listEntered = ref()
provide('listEntered', listEntered)

// NOTE need to use this instead of onMounted, as the latter only triggers once, meaning if user navigates with back button to premade lists view, the activeId for the instance will be set to null and never change again
onIonViewWillEnter(() => {
  if (route.params.id) {
    // console.log(1)
    if (!Object.keys(list.value).length) {
      // console.log(2)
      if (store.activeList) {
        // console.log(3)
        // NOTE creates direct reactive store reference to the list so that computed properties wouldn't have to rerender needlessly when user navigates to a different view. Update: might not be applicable anymore.
        // const listIndex = +route.params.id - 1
        // list.value = store.allLists[listIndex]
        list.value = store.activeList
      } else {
        // console.log(4)
        // ion router allows custom animation for router push
        ionRouter.navigate('/not-found', 'none', 'push')
        return
      }
    }
    store.setActiveId(+route.params.id)
    // TODO see whether the below condition is necessary
  } else if (store.activeId) {
    // console.log(5)
    router.push({ params: { id: store.activeId } })
    // } else if (store.inProgressLists.length > 0) {
    //   router.push({ params: { id: store.inProgressLists[0].listNumber } })
    // } else if (store.untouchedLists.length > 0) {
    //   router.push({ params: { id: store.untouchedLists[0].listNumber } })
    // TODO re-add the below functionality somehow
    // } else {
    //   router.push('/not-found')
  }

  listEntered.value = true
  // console.log(listEntered.value)
})

onIonViewWillLeave(() => {
  listEntered.value = false
  // console.log(listEntered.value)
})
</script>
