<template>
  <ListContent :list="list" route-name="provided-lists" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { List } from '@/stores/modules/types/List'
import ListContent from '@/components/ListContent.vue'
import {
  onIonViewWillEnter,
  onIonViewWillLeave // maybe replace history so that it goes to provided lists view? and do similar for all tabs*
} from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'

const route = useRoute()
const router = useRouter()
const store = useProvidedListsStore()
// const componentKey = 'provided-lists'

// @ts-ignore
const list = ref<List>({})

// NOTE need to use this instead of onMounted, as the latter only triggers once, meaning if user navigates with back button to provided lists view, the activeId for the instance will be set to null and never change again
onIonViewWillEnter(() => {
  if (route.params.id) {
    console.log(1)
    if (!Object.keys(list.value).length) {
      console.log(2)
      if (store.activeList) {
        console.log(3)
        // NOTE creates direct reactive store reference to the list so that computed properties wouldn't have to rerender needlessly when user navigates to a different view. Update: might not be applicable anymore.
        // const listIndex = +route.params.id - 1
        // list.value = store.allLists[listIndex]
        list.value = store.activeList
      } else {
        console.log(4)
        router.push('/not-found')
        return
      }
    }
    store.setActiveId(+route.params.id)
    // TODO see whether the below condition is necessary
  } else if (store.activeId) {
    console.log(0)
    router.push({ params: { id: store.activeId } })
    // } else if (store.inProgressLists.length > 0) {
    //   router.push({ params: { id: store.inProgressLists[0].listNumber } })
    // } else if (store.untouchedLists.length > 0) {
    //   router.push({ params: { id: store.untouchedLists[0].listNumber } })
    // TODO re-add the below functionality somehow
    // } else {
    //   router.push('/not-found')
  }
})

onIonViewWillLeave(() => {
  console.log('test')
})
</script>

<style lang="scss" scoped>
main {
  height: 100%;
}
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 0.3rem;
  padding: 2px 4px;
  margin-bottom: 2rem;
  width: 80px;
}

.back-button:hover {
  cursor: pointer;
}

.message {
  display: flex;
  justify-content: center;
  // margin-top: 2rem;
  min-height: 64px;
  padding: 0 5rem;
  // height: 50px;

  &__text {
    display: flex;
    flex-direction: column;
    span {
      padding-bottom: 0.5rem;
      font-weight: 600;
      color: var(--orange-color);
    }
  }
}

.link {
  color: rgb(84, 191, 226) !important;
  font-weight: 600 !important;
  cursor: pointer;
  transition: 0.4s;
  text-decoration: underline;
}

.link:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.fade-appear-from,
.fade-appear-to {
  opacity: 0;
}
.fade-appear-active {
  transition: opacity 1s;
}
</style>
