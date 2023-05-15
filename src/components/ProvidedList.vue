<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->

    <button @click="returnToLists" class="back-button"><GoBack /> Return to lists</button>
    <TransitionAppear>
      <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />

      <WordChallenge
        v-else-if="list.status === 'TESTING_WORD_ONLY' || list.status === 'TESTING_SENTENCES'"
        :list="list"
      />
    </TransitionAppear>

    <div v-if="list.status === 'LIST_COMPLETE'" class="message">
      <div class="message__text">
        <span>You have completed this list.</span>
        <span>
          Challenge yourself with a different
          <span @click="returnToLists" class="link">List</span> or
          <RouterLink to="/review" class="link">Review</RouterLink> the words you've learned!
        </span>
        <!-- TODO add function that resets the attempts &attemptsSuccessful to 0, sets the list status to 'LIST_NOT_STARTED', and updates list in firestore -->
        <!-- <span>Alternatively, you can try the challenge again.</span> -->
      </div>
    </div>
    <!-- <SentenceChallenge v-else-if="list.status === 'TESTING_SENTENCES'" :list="list" /> -->
    <!-- <div v-if="store.completedLists.length === store.allLists.length">
      <span
        >You have completed all provided lists. Click on any list in the 'Provided Lists' tab to review
        the list.</span
      >
    </div> -->
  </main>
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from 'vue'
import type { List } from '@/stores/modules/types/List'

import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import WordChallenge from '@/components/WordChallenge.vue'
import TransitionAppear from '@/components/transitions/TransitionFade.vue'
import GoBack from '@/assets/icons/go-back.vue'
import { useRoute, useRouter } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
const route = useRoute()
const router = useRouter()
const store = useProvidedListsStore()
// const componentKey = 'provided-lists'

// @ts-ignore
const list = ref<List>({})

const showParagraphChallenge = computed(
  () =>
    Object.keys(list.value).length &&
    (list.value.status === 'LIST_NOT_STARTED' || list.value.status === 'PARAGRAPH_RECORDING_ENDED')
)

const returnToLists = () => {
  router.push({ name: 'provided-lists' })
  store.setActiveId(null)
}

// NOTE onActivated instead of onMounted, as onMounted doesn't trigger
// for keep-alive components
onActivated(() => {
  if (route.params.id) {
    if (!Object.keys(list.value).length) {
      // NOTE get direct reactive store reference to the list
      // means computed properties wouldn't have to rerender needlessly
      if (store.activeList) {
        const listIndex = +route.params.id - 1
        list.value = store.allLists[listIndex]
      } else {
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
    //   router.push('/not-found')
  }
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
  width: 120px;
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
  font-weight: 700 !important;
  cursor: pointer;
}

.link:hover {
  background-color: transparent !important;
}

.fade-appear-from,
.fade-appear-to {
  opacity: 0;
}
.fade-appear-active {
  transition: opacity 1s;
}
</style>
