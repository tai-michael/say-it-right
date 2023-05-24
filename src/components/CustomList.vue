<template>
  <ion-page>
    <TheHeader :show-back-button="true" @back-button-clicked="returnToLists"
      >Custom List {{ list.listNumber }}</TheHeader
    >

    <ion-content class="ion-padding">
      <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />

      <WordChallenge
        v-else-if="list.status === 'TESTING_WORD_ONLY' || list.status === 'TESTING_SENTENCES'"
        :list="list"
      />

      <div v-if="list.status === 'LIST_COMPLETE'" class="message">
        <div class="message__text">
          <span>You have completed this list.</span>
          <span>
            We recommend that you <RouterLink to="/review" class="link">Review</RouterLink> the
            words you've learned!</span
          >
          <span
            >You can also <span @click="returnToLists" class="link">Create or Try</span> another
            list</span
          >
          <span>Or you can <span @click="store.resetList" class="link">Retry</span> this list</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { List } from '@/stores/modules/types/List'
import TheHeader from '@/components/TheHeader.vue'
import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import WordChallenge from '@/components/WordChallenge.vue'
import { IonPage, IonContent } from '@ionic/vue'
// import TransitionAppear from '@/components/transitions/TransitionFade.vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomListsStore } from '@/stores/index.ts'
const route = useRoute()
const router = useRouter()
const store = useCustomListsStore()
// const componentKey = 'custom-list'

// @ts-ignore
const list = ref<List>({})

const showParagraphChallenge = computed(
  () =>
    Object.keys(list.value).length &&
    (list.value?.status === 'LIST_NOT_STARTED' ||
      list.value?.status === 'PARAGRAPH_RECORDING_ENDED')
)

const returnToLists = () => {
  store.setActiveId(null)
  router.push({ name: 'custom-lists' })
}

// NOTE onActivated instead of onMounted, as onMounted doesn't trigger for keep-alive components
onMounted(() => {
  if (route.params.id) {
    console.log(route.params.id)
    if (!Object.keys(list.value).length) {
      console.log(list.value)
      console.log(store)
      console.log(store.activeList)
      // NOTE this creates a direct reactive store reference to the list, meaning computed properties wouldn't have to rerender needlessly when user navigates to a different view
      if (store.activeList) {
        // TODO this stuff is different from ProvidedList's; consider why
        const listNum = store.activeList.listNumber
        list.value = store.allLists[listNum - 1]
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

<style lang="scss" scoped>
main {
  height: 100%;
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
  font-weight: 700 !important;
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

.loading-container {
  margin: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

// .submit-form {
//   display: flex;
//   // row-gap: 2rem;

//   .input-container {
//     display: flex;
//     flex-direction: column;
//     width: 100%;

//     label {
//       margin-bottom: 0.5rem;
//     }
//   }
//   .input-field {
//     display: flex;

//     input {
//       width: 100%;
//     }
//   }
// }

// .error {
//   margin-top: 1rem;
//   // color: hsl(2, 65%, 54%);
//   color: var(--orange-color);
// }
</style>
