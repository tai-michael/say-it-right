<template>
  <main>
    <form
      v-if="!Object.keys(list).length"
      class="submit-form"
      @submit.prevent="submitWords(wordsInput)"
    >
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

    <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />

    <WordChallenge v-else-if="list.status === 'WORD_CHALLENGE_STARTED'" :list="list" />

    <SentenceChallenge v-else-if="list.status === 'SENTENCE_CHALLENGE_STARTED'" :list="list" />

    <!-- TODO add in WordChallenge and SentenceChallenge -->
  </main>
</template>

<script setup>
import { computed, onActivated, ref } from 'vue'

import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import WordChallenge from '@/components/WordChallenge.vue'
import SentenceChallenge from '@/components/SentenceChallenge.vue'
import useCreateOpenAiParagraph from '@/composables/useCreateOpenAiParagraph'
import LoadingDots from '@/components/LoadingDots.vue'

import { useRoute, useRouter } from 'vue-router'
import { useCustomListsStore } from '@/stores'
const route = useRoute()
const router = useRouter()
const store = useCustomListsStore()
// const componentKey = 'custom-list'

let isLoading = ref(false)
let wordsInput = ref('')
let newlyCreatedParagraph = ref('')

const list = ref({})

const showParagraphChallenge = computed(
  () =>
    Object.keys(list.value).length &&
    (list.value.status === 'LIST_NOT_STARTED' || list.value.status === 'PARAGRAPH_RECORDING_ENDED')
)

// TODO probably need to add error-handling in here for openai
const submitWords = async (words) => {
  if (!words) return

  isLoading.value = true

  const wordsArray = words.trim().split(/[ ,]+/)
  newlyCreatedParagraph.value = await useCreateOpenAiParagraph(wordsArray)
  createNewListObjectFromWords(wordsArray, store.allLists, newlyCreatedParagraph.value)

  router.push({ params: { id: store.allLists.length } })
  isLoading.value = false
}

function createNewListObjectFromWords(words, allLists, paragraph) {
  const newListObject = {
    listNumber: allLists.length + 1,
    words: {},
    status: 'LIST_NOT_STARTED',
    paragraph: paragraph
  }

  words.forEach((word) => {
    newListObject.words[word] = {
      attempts: 0,
      attemptsSuccessful: 0
    }
  })

  allLists.push(newListObject)
}

// NOTE onActivated instead of onMounted, as onMounted doesn't trigger
// for keep-alive components
onActivated(() => {
  if (route.params.id) {
    if (!Object.keys(list.value).length) {
      // NOTE get direct reactive store reference to the list
      // means computed properties wouldn't have to rerender needlessly
      const listNum = store.activeList.listNumber
      list.value = store.allLists[listNum - 1]
    }
    store.setActiveId(route.params.id)
  } else if (store.activeId) {
    router.push({ params: { id: store.activeId } })
  } else if (store.inProgressLists.length > 0) {
    router.push({ params: { id: store.inProgressLists[0].listNumber } })
  } else if (store.untouchedLists.length > 0) {
    router.push({ params: { id: store.untouchedLists[0].listNumber } })
  }
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
