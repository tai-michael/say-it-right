<template>
  <main>
    <form v-if="!generatedParagraph" class="submit-form" @submit.prevent="submitWords(wordList)">
      <div class="input-container">
        <label>Insert words separated by spaces or commas:</label>
        <div class="input-field">
          <input placeholder="e.g. urban thin kindly" v-model="wordsInput" autofocus />
          <button type="submit">Submit</button>
        </div>
      </div>
    </form>
    <div v-if="isLoading" class="loading-container">
      <LoadingDots />
    </div>
    <ParagraphTest v-if="generatedParagraph" :wordList="wordList" :paragraph="generatedParagraph" />
  </main>
</template>

<script setup>
import ParagraphTest from '@/components/ParagraphTest.vue'
import LoadingDots from '@/components/LoadingDots.vue'
import useCreateOpenAiParagraph from '@/composables/useCreateOpenAiParagraph'
import { ref, computed } from 'vue'

let isLoading = ref(false)
let wordsInput = ref('')
const wordList = computed(() => wordsInput.value.trim().split(/[ ,]+/))

let generatedParagraph = ref('')
const submitWords = async (words) => {
  if (!words) return
  isLoading.value = true
  generatedParagraph.value = await useCreateOpenAiParagraph(words)
  isLoading.value = false
}
</script>

<style lang="scss" scoped>
.submit-form {
  display: flex;
  // row-gap: 2rem;

  .input-container {
    display: flex;
    flex-direction: column;
    width: 100%;

    label {
      margin-bottom: 5px;
    }
  }
  .input-field {
    display: flex;

    input {
      width: 100%;
    }
  }
}

.loading-container {
  margin: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
