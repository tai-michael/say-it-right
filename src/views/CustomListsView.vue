<template>
  <ion-page>
    <TheHeader :is-loading="isLoading">Custom Lists</TheHeader>
    <ion-content class="ion-padding">
      <form class="submit-form" @submit.prevent="submitWords(wordsInput)">
        <div class="input-container">
          <label>Insert up to 7 words separated by spaces or commas:</label>
          <ion-searchbar
            :search-icon="createOutline"
            placeholder="  e.g. urban thin kindly"
            v-model="wordsInput"
            :disabled="isLoading"
            autofocus
            animated="true"
          ></ion-searchbar>
          <!-- <ion-button v-if="isLoading" ><LoadingDots /></ion-button>
          <ion-button v-else type="submit" :disabled="isLoading" class="color">Submit</ion-button> -->
        </div>
      </form>

      <!-- <div v-if="isLoading" class="loading-container">
      <LoadingDots />
    </div> -->

      <div v-if="submissionError" class="error">{{ submissionError }}</div>

      <div v-if="store.inProgressLists.length" class="flex">
        <label>In Progress</label>
        <ListLinks :lists="store.inProgressLists" :routeName="'custom-list'" />
      </div>

      <div v-if="store.untouchedLists.length" class="mb-7 flex flex-col">
        <!-- <hr v-if="store.inProgressLists.length" /> -->
        <ion-item-divider class="mb-3"
          ><ion-label v-if="anyListStarted">New</ion-label></ion-item-divider
        >
        <ListLinks :lists="store.untouchedLists" :routeName="'custom-list'" />
      </div>

      <div v-if="store.completedLists.length" class="flex flex-col">
        <!-- <hr v-if="store.inProgressLists.length || store.untouchedLists.length" /> -->
        <ion-item-divider class="mb-3"><ion-label>Completed</ion-label></ion-item-divider>
        <ListLinks :lists="store.completedLists" :routeName="'custom-list'" />
      </div>
    </ion-content>

    <!-- <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" :key="$route.fullPath"></component>
      </keep-alive>
    </router-view> -->
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide } from 'vue'
import { createOutline } from 'ionicons/icons'
// import LoadingDots from '@/components/LoadingDots.vue'
import TheHeader from '@/components/TheHeader.vue'
import ListLinks from '@/components/ListLinks.vue'
import useOpenAiParagraphGenerator from '@/composables/useOpenAiParagraphGenerator'
import type { List } from '@/stores/modules/types/List'
import { useCustomListsStore } from '@/stores/index.ts'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage, IonSearchbar, IonItemDivider, IonLabel } from '@ionic/vue'

const route = useRoute()
const router = useRouter()

const store = useCustomListsStore()

const anyListStarted = computed(() => store.inProgressLists.length || store.completedLists.length)

const wordsInput = ref('')
const isLoading = ref(false)
// provide('isLoading', isLoading)
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
    wordsInput.value = ''
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
  background-color: rgba(78, 78, 78, 0.623); // gray
}

// ion-button {
//   --background: #93e9be;
//   --border-radius: 8px;
// }

ion-toolbar {
  --display: flex;
  --justify-content: space-between;
  // --background: red;
}

.submit-form {
  display: flex;
  margin-bottom: 1.2rem;
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

hr {
  margin: 1.5rem 0;
}
</style>
