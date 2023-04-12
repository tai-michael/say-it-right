<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphTest v-if="showParagraphTest" :wordList="wordList" :paragraph="paragraph" />

    <WordTest v-else-if="store.activeList?.testStatus === 'word test in progress'" />

    <SentenceTest v-else-if="store.activeList?.testStatus === 'sentence test in progress'" />

    <div v-if="store.completelyTestedLists.length === store.allLists.length">
      <span
        >You have completed all suggested lists. Click on any list in the Word Lists tab to review
        the list.</span
      >
    </div>
  </main>
</template>

<script setup>
import { computed, onActivated } from 'vue'

import ParagraphTest from '@/components/ParagraphTest.vue'
import SentenceTest from '@/components/SentenceTest.vue'
import WordTest from '@/components/WordTest.vue'

import { useRoute, useRouter } from 'vue-router'
import { useSuggestedListStore } from '@/stores/suggested'
const route = useRoute()
const router = useRouter()
const store = useSuggestedListStore()
// const componentKey = 'suggested'

// NOTE the optional chaining operator (?.) is needed because activeList becomes undefined if we mount this tab with no params id, or if we navigate to the Word Lists tab
const paragraph = computed(() => {
  return store.activeList?.paragraph
})

const showParagraphTest = computed(
  () =>
    store.activeList?.testStatus === 'not started' ||
    store.activeList?.testStatus === 'paragraph test recording completed'
)

const wordList = computed(() => {
  return Object.keys(store.activeList?.words)
})

// NOTE activeId is needed for persisting id between tab switches
// if no id, the view defaults to partially tested lists, then untested lists
const activeId = computed(() => {
  return (
    route.params.id ||
    store.activeId ||
    store.partiallyTestedLists[0]?.listNumber ||
    store.untestedLists[0]?.listNumber
  )
})

// NOTE onActivated instead of onMounted, as onMounted doesn't trigger
// for keep-alive components
onActivated(() => {
  router.push({ params: { id: activeId.value } })
  store.setActiveId(route.params.id)
})
</script>

<style lang="scss" scoped></style>
