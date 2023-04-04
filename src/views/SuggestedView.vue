<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphTest
      v-if="shouldShowParagraph"
      :wordList="wordList"
      :paragraph="generatedParagraph"
    />

    <WordTest v-else-if="store.paragraphTestCompleted && !store.wordTestCompleted" />

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
  wordList.value = store.allProvidedWords.flatMap((word) => (word.set === 1 ? word.word : []))
})

const wordList = ref([])

const shouldShowParagraph = computed(
  () =>
    generatedParagraph.value && Object.keys(wordList.value).length && !store.paragraphTestCompleted
)

let generatedParagraph = ref(
  'Stephen Hawking was a courageous and successful scientist who inspired many people throughout society. He had vivid ideas and a variety of interests, which he pursued with discipline and careful study. He was known for his wise words, and many people were comforted by his advice. He often said that to succeed in life, one must think carefully and have a solid plan.'
)
</script>

<style lang="scss" scoped>
.submit-form {
  max-width: 50rem;
  width: 100%;

  .input-container {
    display: flex;
    flex-direction: column;
  }
}
</style>
