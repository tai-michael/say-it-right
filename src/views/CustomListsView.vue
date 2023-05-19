<template>
  <main>
    <form class="submit-form" @submit.prevent="submitWords(wordsInput)">
      <div class="input-container">
        <label>Insert up to 7 words separated by spaces or commas:</label>
        <div class="input-field">
          <input placeholder="e.g. urban thin kindly" v-model="wordsInput" autofocus />
          <button v-if="isLoading" :disabled="isLoading"><LoadingDots /></button>
          <button v-else type="submit" :disabled="isLoading">Submit</button>
        </div>
      </div>
    </form>

    <!-- <div v-if="isLoading" class="loading-container">
      <LoadingDots />
    </div> -->

    <div v-if="submissionError" class="error">{{ submissionError }}</div>

    <div v-if="store.inProgressLists.length" class="lists">
      <label>In Progress</label>
      <ListLinks :lists="store.inProgressLists" :routeName="'custom-list'" />
    </div>

    <div v-if="store.untouchedLists.length" class="lists">
      <hr v-if="store.inProgressLists.length" />
      <label v-if="anyListStarted">New</label>
      <ListLinks :lists="store.untouchedLists" :routeName="'custom-list'" />
    </div>

    <div v-if="store.completedLists.length" class="lists">
      <hr v-if="store.inProgressLists.length || store.untouchedLists.length" />
      <label>Completed</label>
      <ListLinks :lists="store.completedLists" :routeName="'custom-list'" />
    </div>

    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" :key="$route.fullPath"></component>
      </keep-alive>
    </router-view>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ListLinks from '@/components/ListLinks.vue'
import useOpenAiParagraphGenerator from '@/composables/useOpenAiParagraphGenerator'
import type { List } from '@/stores/modules/types/List'
import LoadingDots from '@/components/LoadingDots.vue'
import { useCustomListsStore } from '@/stores/index.ts'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const store = useCustomListsStore()

const anyListStarted = computed(() => store.inProgressLists.length || store.completedLists.length)

const wordsInput = ref('')
const isLoading = ref(false)
const submissionError = ref('')
const newlyCreatedParagraph = ref('')

// TODO add error-handling in here for openai
const submitWords = async (words: string) => {
  try {
    if (!words) return (submissionError.value = 'Please enter at least one word')

    submissionError.value = ''

    const wordsArray = words.trim().toLowerCase().replace(/^,|,$/g, '').split(/[ ,]+/)
    const uniqueWordsArray = [...new Set(wordsArray)]
    if (uniqueWordsArray.length > 7) return (submissionError.value = 'Please enter at MOST 7 words')

    isLoading.value = true
    // TODO if user enters just one word, do a SingleWordChallenge
    // instead of a ParagraphChallenge; put below code block in
    // in condition (or just 'return' at end of implementation of
    // single word challenge)
    // Maybe add a 'word' prop to WordChallenge, and use conditions

    newlyCreatedParagraph.value = await useOpenAiParagraphGenerator(uniqueWordsArray)

    createNewListFromWords(uniqueWordsArray, store.allLists, newlyCreatedParagraph.value)

    await store.updateListsInFirestore()
    isLoading.value = false
    // REVIEW uncomment below if I want to automatically direct the user to a list right after generating it
    // router.push({ params: { id: store.allLists.length } })
  } catch (err) {
    console.log(err)
    isLoading.value = false
    submissionError.value = 'Oops! Something went wrong. Please try again'
  }
}

const createNewListFromWords = (words: string[], allLists: List[], paragraph: string) => {
  const newListObject: List = {
    listNumber: allLists.length + 1,
    status: 'LIST_NOT_STARTED',
    paragraph: paragraph,
    words: {}
  }

  words.forEach((word) => {
    newListObject.words[word] = {
      sentences: [],
      attempts: 0,
      attemptsSuccessful: 0
    }
  })

  allLists.push(newListObject)
}

onMounted(() => {
  // check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // redirect to error component
    console.log(route.params)
    router.push('/not-found')
  }
})
</script>

<style lang="scss" scoped>
hr {
  border: none;
  height: 0.5px;
  background-color: var(--vt-c-text-dark-2); // gray
}

.submit-form {
  display: flex;
  margin-bottom: 2rem;
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
      height: 35px;
      padding: 0.5rem;
      width: 100%;
    }

    button {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
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

.lists {
  display: flex;
  flex-direction: column;

  label {
    padding-bottom: 1rem;
    font-weight: 700;
  }
}

hr {
  margin: 1.5rem 0;
}
</style>
