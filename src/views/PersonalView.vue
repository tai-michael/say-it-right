<template>
  <main>
    <form v-if="!paragraph" class="submit-form" @submit.prevent="submitWords(wordsInput)">
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

    <ParagraphChallenge
      v-if="paragraph"
      :words="words"
      :paragraph="paragraph"
      @paragraph-test-completed="paragraphChallengeCompleted = true"
    />

    <!-- TODO add in WordChallenge and SentenceChallenge -->
  </main>
</template>

<script setup>
import { computed, onActivated, ref } from 'vue'

import LoadingDots from '@/components/LoadingDots.vue'
import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import useCreateOpenAiParagraph from '@/composables/useCreateOpenAiParagraph'

import { useRoute, useRouter } from 'vue-router'
import { usePersonalListStore } from '@/stores/personal'
const route = useRoute()
const router = useRouter()
const store = usePersonalListStore()
// const componentKey = 'personal'

let isLoading = ref(false)
let wordsInput = ref('')
let newlyCreatedParagraph = ref('')

// NOTE the optional chaining operator (?.) is needed because activeList becomes undefined if we mount this tab with no params id, or if we navigate to the Overview tab
const paragraph = computed(() => {
  return store.activeList?.paragraph
})

const words = computed(() => {
  return Object.keys(store.activeList?.words)
})

// NOTE activeId is needed for persisting id between tab switches
// if no id, the view defaults to partially tested lists, then untested lists
const activeId = computed(() => {
  return (
    route.params.id ||
    store.activeId ||
    store.inProgressLists[0]?.listNumber ||
    store.untouchedLists[0]?.listNumber
  )
})

// NOTE onActivated instead of onMounted, as onMounted doesn't trigger
// for keep-alive components
onActivated(() => {
  if (store.allLists.length > 0) router.push({ params: { id: activeId.value } })
})

const submitWords = async (words) => {
  if (!words) return
  isLoading.value = true
  const wordsArray = words.trim().split(/[ ,]+/)
  newlyCreatedParagraph.value = await useCreateOpenAiParagraph(wordsArray)
  createNewListObjectFromWords(wordsArray, store.allLists, newlyCreatedParagraph.value)
  router.push({ params: { id: store.allLists.length } })
  // store.setActiveId(route.params.id)
  isLoading.value = false
}

function createNewListObjectFromWords(words, allLists, paragraph) {
  const newListObject = {
    listNumber: allLists.length + 1,
    words: {},
    testingStarted: false,
    testingCompleted: false,
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
