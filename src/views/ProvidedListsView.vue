<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />

    <WordChallenge
      v-else-if="
        list.status === 'WORD_CHALLENGE_STARTED' || list.status === 'SENTENCE_CHALLENGE_STARTED'
      "
      :list="list"
    />

    <!-- <SentenceChallenge v-else-if="list.status === 'SENTENCE_CHALLENGE_STARTED'" :list="list" /> -->

    <div v-if="store.completedLists.length === store.allLists.length">
      <span
        >You have completed all provided lists. Click on any list in the 'Overview' tab to review
        the list.</span
      >
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from 'vue'
import type { List } from '@/stores/modules/types/List'

import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import WordChallenge from '@/components/WordChallenge.vue'
import SentenceChallenge from '@/components/SentenceChallenge.vue'

import { useRoute, useRouter } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
const route = useRoute()
const router = useRouter()
const store = useProvidedListsStore()
// const componentKey = 'provided-lists'

// NOTE the 'Record<string, never>' type represents an empty object with
// string keys and values of type 'never'
const list = ref<List>({})

const showParagraphChallenge = computed(
  () =>
    Object.keys(list.value).length &&
    (list.value.status === 'LIST_NOT_STARTED' || list.value.status === 'PARAGRAPH_RECORDING_ENDED')
)

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
  } else if (store.activeId) {
    router.push({ params: { id: store.activeId } })
  } else if (store.inProgressLists.length > 0) {
    router.push({ params: { id: store.inProgressLists[0].listNumber } })
  } else if (store.untouchedLists.length > 0) {
    router.push({ params: { id: store.untouchedLists[0].listNumber } })
  } else {
    router.push('/not-found')
  }
})
</script>

<style lang="scss" scoped></style>
