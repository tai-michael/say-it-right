<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphTest v-if="showParagraphTest" :listObject="listObject" />

    <WordTest v-else-if="listObject.testStatus === 'word test in progress'" />

    <SentenceTest v-else-if="listObject.testStatus === 'sentence test in progress'" />

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

import ParagraphTest from '@/components/ParagraphTest.vue'
import SentenceTest from '@/components/SentenceTest.vue'
import WordTest from '@/components/WordTest.vue'

import { useRoute, useRouter } from 'vue-router'
import { useSuggestedListStore } from '@/stores/suggested'
const route = useRoute()
const router = useRouter()
const store = useSuggestedListStore()
// const componentKey = 'suggested'

const listObject = ref({})

const showParagraphTest = computed(
  () =>
    Object.keys(listObject.value).length &&
    (listObject.value.testStatus === 'not started' ||
      listObject.value.testStatus === 'paragraph test recording completed')
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
