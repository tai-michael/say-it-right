<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphTest
      v-if="shouldShowParagraphTest"
      :wordList="wordList"
      :paragraph="generatedParagraph"
      @paragraph-test-completed="paragraphTestCompleted = true"
    />

    <WordTest v-else-if="shouldShowWordTest" />

    <SentenceTest v-else />

    <div v-if="allTestsCompleteMessage">
      You have completed all suggested lists. Click on any list in the Word Lists tab to review it.
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

const wordList = ref([])
const allTestsCompleteMessage = ref(false)
const paragraphTestCompleted = ref(false)
// const componentKey = 'suggested'

// TODO add respective paragraphs too
onActivated(() => {
  if (route.params.id) {
    store.setActiveId(route.params.id)
    wordList.value = Object.keys(store.activeList.words)
  } else if (store.activeId) {
    router.push({ params: { id: store.activeId } })
  } else if (store.partiallyTestedLists.length > 0) {
    store.setActiveId(store.partiallyTestedLists[0].listNumber)
    wordList.value = Object.keys(store.partiallyTestedLists[0].words)
    router.push({ params: { id: store.partiallyTestedLists[0].listNumber } })
  } else if (store.untestedLists.length > 0) {
    store.setActiveId(store.untestedLists[0].listNumber)
    router.push({ params: { id: store.untestedLists[0].listNumber } })
    wordList.value = Object.keys(store.untestedLists[0].words)
  } else allTestsCompleteMessage.value = true
})

// const id = computed(() => ref(route.params.id))

// watch(id, (newId) => {
//   if (newId) {
//     wordList.value = Object.keys(store.activeList.words)
//   } else if (store.partiallyTestedLists.length > 0) {
//     wordList.value = Object.keys(store.partiallyTestedLists[0].words)
//     route.push({ params: { id: store.partiallyTestedLists[0].listNumber } })
//   } else if (store.untestedLists.length > 0) {
//     wordList.value = Object.keys(store.untestedLists[0].words)
//   } else {
//     allTestsCompleteMessage.value = true
//   }
// })
// watch(
//   () => store.activeList,
//   (activeList) => {
//     if (activeList) {
//       wordList.value = Object.keys(activeList.words)
//       console.log(store.activeList)
//     }
//   }
// )
// const wordList = computed(() => Object.keys(store.activeList.words))

let generatedParagraph = ref(
  'Stephen Hawking was a courageous and successful scientist who inspired many people throughout society. He had vivid ideas and a variety of interests, which he pursued with discipline and careful study. He was known for his wise words, and many people were comforted by his advice. He often said that to succeed in life, one must think carefully and have a solid plan.'
)

const shouldShowParagraphTest = computed(
  () =>
    generatedParagraph.value && Object.keys(wordList.value).length && !paragraphTestCompleted.value
)

const shouldShowWordTest = computed(() => paragraphTestCompleted.value && !store.wordTestCompleted)
</script>

<style lang="scss" scoped></style>
