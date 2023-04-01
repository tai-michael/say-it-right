<template>
  <main>
    <!-- <LoadingDots v-if="isLoading" /> -->
    <ParagraphTest
      v-if="generatedParagraph && !store.paragraphTestCompleted"
      :wordList="wordList"
      :paragraph="generatedParagraph"
    />

    <WordTest v-else-if="store.paragraphTestCompleted && !store.wordTestCompleted" />

    <SentenceTest v-else />
  </main>
</template>

<script setup>
import { ref } from 'vue'

import ParagraphTest from '@/components/ParagraphTest.vue'
import SentenceTest from '@/components/SentenceTest.vue'
import WordTest from '@/components/WordTest.vue'

import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()

// const componentKey = 'suggested'

const wordList = ref([
  'vivid',
  'successful',
  'inspired',
  'variety',
  'think',
  'said',
  'comforted',
  'he', // replace this word, maybe with world (e.g. 'many people around the world were...')
  'plan',
  'study',
  'courageous',
  'society',
  'discipline'
])

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
