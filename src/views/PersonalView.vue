<template>
  <main>
    <form v-if="!generatedParagraph" class="submit-form" @submit.prevent="submitWords(wordsInput)">
      <div class="input-container">
        <label>Insert up to 10 words separated by spaces or commas:</label>
        <div class="input-field">
          <input placeholder="e.g. urban thin kindly" v-model="wordsInput" autofocus />
          <button type="submit" :disabled="isLoading">Submit</button>
        </div>
      </div>
    </form>

    <div v-if="isLoading" class="loading-container">
      <LoadingDots />
    </div>

    <ParagraphTest
      v-if="generatedParagraph"
      :wordList="wordList"
      :paragraph="generatedParagraph"
      @paragraph-test-completed="paragraphTestCompleted = true"
    />
  </main>
</template>

<script setup>
import { onActivated, ref } from 'vue'

import LoadingDots from '@/components/LoadingDots.vue'
import ParagraphTest from '@/components/ParagraphTest.vue'
import useCreateOpenAiParagraph from '@/composables/useCreateOpenAiParagraph'

import { useRoute, useRouter } from 'vue-router'
import { usePersonalListStore } from '@/stores/personal'
const route = useRoute()
const router = useRouter()
const store = usePersonalListStore()

// const componentKey = 'personal'
let isLoading = ref(false)
let wordsInput = ref('')
// const wordList = computed(() => wordsInput.value.trim().split(/[ ,]+/))
const wordList = ref([])

let generatedParagraph = ref('')
const submitWords = async (words) => {
  if (!words) return
  isLoading.value = true
  wordList.value = words.trim().split(/[ ,]+/)
  generatedParagraph.value = await useCreateOpenAiParagraph(wordList.value)
  convertWordListToListObject(wordList.value, store.allLists, generatedParagraph.value)
  router.push({ params: { id: store.allLists.length } })
  // store.setActiveId(route.params.id)
  isLoading.value = false
}

function convertWordListToListObject(wordList, allLists, paragraph) {
  const newListObject = {
    listNumber: allLists.length + 1,
    words: {},
    testingStarted: false,
    testingCompleted: false,
    paragraph: paragraph
  }

  wordList.forEach((word) => {
    newListObject.words[word] = {
      attempts: 0,
      attemptsSuccessful: 0
    }
  })

  allLists.push(newListObject)
}

// TODO add respective paragraphs too
onActivated(() => {
  if (route.params.id && store.allLists.length > 0) {
    store.setActiveId(route.params.id)
    wordList.value = Object.keys(store.activeList.words)
    generatedParagraph.value = store.activeList.paragraph
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
  }
  // }else
})
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
      margin-bottom: 0.5rem;
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
