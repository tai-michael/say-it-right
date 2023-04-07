<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphTest
      v-if="shouldShowParagraphTest"
      :wordList="wordList"
      :paragraph="generatedParagraph"
    />

    <WordTest v-else-if="shouldShowWordTest" />

    <SentenceTest v-else />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import ParagraphTest from '@/components/ParagraphTest.vue'
import SentenceTest from '@/components/SentenceTest.vue'
import WordTest from '@/components/WordTest.vue'

import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()

// const componentKey = 'suggested'
onMounted(() => {
  // the set number should be replaced by parameter in url; or by action/prop/event or whatever when user clicks on the list. Action would make most sense if i don't want to deal with router params, in which case the 1 would be replaced by a store getter (e.g. activeSetNumber). The action would also map the testStatus to 'testing / isTesting'
  // wordList.value = store.allProvidedWords.flatMap((word) => (word.list === 1 ? word.word : []))
})

const wordList = ref([])

let generatedParagraph = ref(
  'Stephen Hawking was a courageous and successful scientist who inspired many people throughout society. He had vivid ideas and a variety of interests, which he pursued with discipline and careful study. He was known for his wise words, and many people were comforted by his advice. He often said that to succeed in life, one must think carefully and have a solid plan.'
)

const shouldShowParagraphTest = computed(
  () =>
    generatedParagraph.value && Object.keys(wordList.value).length && !store.paragraphTestCompleted
)

const shouldShowWordTest = computed(() => store.paragraphTestCompleted && !store.wordTestCompleted)
</script>

<style lang="scss" scoped></style>
