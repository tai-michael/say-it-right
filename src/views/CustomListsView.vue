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

    <div v-if="submissionError" class="error">Oops! Something went wrong. Please try again.</div>

    <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />

    <WordChallenge v-else-if="list.status === 'WORD_CHALLENGE_STARTED'" :list="list" />

    <SentenceChallenge v-else-if="list.status === 'SENTENCE_CHALLENGE_STARTED'" :list="list" />

    <!-- TODO add in WordChallenge and SentenceChallenge -->
  </main>
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from 'vue'
import type { List } from '@/stores/modules/types/List'

import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import WordChallenge from '@/components/WordChallenge.vue'
import SentenceChallenge from '@/components/SentenceChallenge.vue'
import useOpenAiParagraphGenerator from '@/composables/useOpenAiParagraphGenerator'
import LoadingDots from '@/components/LoadingDots.vue'

import { useRoute, useRouter } from 'vue-router'
import { useCustomListsStore } from '@/stores/index.ts'
const route = useRoute()
const router = useRouter()
const store = useCustomListsStore()
// const componentKey = 'custom-list'

const isLoading = ref(false)
const wordsInput = ref('')
const newlyCreatedParagraph = ref('')
const submissionError = ref(false)

const list = ref<List | Record<string, never>>({})

const showParagraphChallenge = computed(
  () =>
    Object.keys(list.value).length &&
    (list.value?.status === 'LIST_NOT_STARTED' ||
      list.value?.status === 'PARAGRAPH_RECORDING_ENDED')
)

// TODO probably need to add error-handling in here for openai
const submitWords = async (words: string) => {
  try {
    if (!words) return
    submissionError.value = false
    isLoading.value = true

    const wordsArray = words.trim().split(/[ ,]+/)

    newlyCreatedParagraph.value = await useOpenAiParagraphGenerator(wordsArray)

    createNewListObjectFromWords(wordsArray, store.allLists, newlyCreatedParagraph.value)

    await store.updateListsInFirestore()
    router.push({ params: { id: store.allLists.length } })
  } catch (err) {
    console.log(err)
    isLoading.value = false
    submissionError.value = true
  }
}

function createNewListObjectFromWords(words: string[], allLists: List[], paragraph: string) {
  const newListObject: List = {
    listNumber: allLists.length + 1,
    status: 'LIST_NOT_STARTED',
    paragraph: paragraph,
    words: {}
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
      // NOTE this creates a direct reactive store reference to the list,
      // meaning computed properties wouldn't have to rerender needlessly
      if (store.activeList) {
        const listNum = store.activeList.listNumber
        list.value = store.allLists[listNum - 1]
        isLoading.value = false
      } else {
        router.push('/custom-lists')
        return
      }
    }
    store.setActiveId(+route.params.id)
  } else if (store.activeId) {
    router.push({ params: { id: store.activeId } })
  } else if (store.inProgressLists.length > 0) {
    router.push({ params: { id: store.inProgressLists[0].listNumber } })
  } else if (store.untouchedLists.length > 0) {
    router.push({ params: { id: store.untouchedLists[0].listNumber } })
  } else {
    router.push('/custom-lists')
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

.error {
  margin-top: 1rem;
  // color: hsl(2, 65%, 54%);
  color: var(--orange-color);
}

.loading-container {
  margin: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
