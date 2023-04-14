<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphChallenge v-if="showParagraphChallenge" :listObject="listObject" />

    <WordChallenge v-else-if="listObject.testStatus === 'WORD_CHALLENGE_STARTED'" />

    <SentenceChallenge v-else-if="listObject.testStatus === 'SENTENCE_CHALLENGE_STARTED'" />

    <div v-if="store.completelyTestedLists.length === store.allLists.length">
      <span
        >You have completed all suggested lists. Click on any list in the Word Lists tab to review
        the list.</span
      >
    </div>
  </main>
</template>

<script setup>
import { computed, onActivated, ref } from 'vue'

import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import SentenceChallenge from '@/components/SentenceChallenge.vue'
import WordChallenge from '@/components/WordChallenge.vue'

import { useRoute, useRouter } from 'vue-router'
import { useSuggestedListStore } from '@/stores/suggested'
const route = useRoute()
const router = useRouter()
const store = useSuggestedListStore()
// const componentKey = 'suggested'

const listObject = ref({})

const showParagraphChallenge = computed(
  () =>
    Object.keys(listObject.value).length &&
    (listObject.value.testStatus === 'TEST_NOT_STARTED' ||
      listObject.value.testStatus === 'PARAGRAPH_RECORDING_ENDED')
)

// NOTE onActivated instead of onMounted, as onMounted doesn't trigger
// for keep-alive components
onActivated(() => {
  if (route.params.id) {
    if (!Object.keys(listObject.value).length) {
      // NOTE get direct reactive store reference to the list
      // means computed properties wouldn't have to rerender needlessly
      const listNum = store.activeList.listNumber
      listObject.value = store.allLists[listNum - 1]
    }
    store.setActiveId(route.params.id)
  } else if (store.activeId) {
    router.push({ params: { id: store.activeId } })
  } else if (store.partiallyTestedLists.length > 0) {
    router.push({ params: { id: store.partiallyTestedLists[0].listNumber } })
  } else if (store.untestedLists.length > 0) {
    router.push({ params: { id: store.untestedLists[0].listNumber } })
  }
})
</script>

<style lang="scss" scoped></style>
