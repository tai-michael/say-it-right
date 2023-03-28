<template>
  <main>
    <form class="submit-form" @submit.prevent="submitWords(wordList)">
      <input class="input-field" placeholder="Insert words split by spaces" v-model="wordsInput" />
      <button type="submit">Submit</button>
    </form>
    <ParagraphTest v-if="generatedParagraph" :wordList="wordList" :paragraph="generatedParagraph" />
  </main>
</template>

<script setup>
import ParagraphTest from '@/components/ParagraphTest.vue'
import useCreateOpenAiParagraph from '@/composables/useCreateOpenAiParagraph'
import { ref, computed } from 'vue'

let wordsInput = ref('')
const wordList = computed(() => wordsInput.value.trim().split(' '))

let generatedParagraph = ref('')
const submitWords = async (words) => {
  if (!words) return
  generatedParagraph.value = await useCreateOpenAiParagraph(words)
}
</script>

<style lang="scss" scoped>
.submit-form {
  max-width: 50rem;
  width: 100%;
}
</style>
