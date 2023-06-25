<template>
  <ion-page>
    <TheHeader :is-loading="isLoading">Custom Lists</TheHeader>

    <ion-content class="ion-padding" ref="content">
      <PullRefresher />
      <div ref="scrollTrigger" class="scroll-trigger"></div>

      <div v-if="tabMounted">
        <form class="submit-form" @submit.prevent="submitWords(wordsInput)">
          <div class="input-container">
            <label>Enter up to 7 words separated by spaces or commas:</label>
            <ion-searchbar
              :search-icon="createOutline"
              placeholder="  e.g. urban thin kindly"
              v-model="wordsInput"
              :disabled="isLoading"
              autofocus
              animated="true"
              :show-clear-button="clearButtonMode"
            ></ion-searchbar>
            <!-- <ion-button v-if="isLoading" ><LoadingDots /></ion-button>
          <ion-button v-else type="submit" :disabled="isLoading" class="color">Submit</ion-button> -->
          </div>
        </form>

        <div v-if="submissionError" class="error">{{ submissionError }}</div>

        <ListGroups :route-name="route.name" @list-deleted="setToastOpen('List deleted')" />
      </div>

      <div v-else class="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>

      <ion-toast
        :is-open="toastMessage ? true : false"
        :message="toastMessage"
        :duration="3000"
        @didDismiss="setToastOpen('')"
      ></ion-toast>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end">
      <ion-fab-button @click="scrollToTop" aria-label="Scroll to top" v-if="isVisible">
        <ion-icon :icon="arrowUp"></ion-icon>
      </ion-fab-button>
    </ion-fab>
    <!-- <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" :key="$route.fullPath"></component>
      </keep-alive>
    </router-view> -->
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { createOutline } from 'ionicons/icons'
import PullRefresher from '@/components/PullRefresher.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import TheHeader from '@/components/TheHeader.vue'
import ListGroups from '@/components/ListGroups.vue'
import useOpenAiParagraphGenerator from '@/composables/useOpenAiParagraphGenerator'
import useSentencesCreationAndStorage from '@/composables/useSentencesCreationAndStorage'
import type { List } from '@/stores/modules/types/List'
import type { WordObject } from '@/stores/modules/types/Review'
import { useCustomListsStore } from '@/stores/index.ts'
import { useRoute, useRouter } from 'vue-router'
import {
  IonContent,
  IonPage,
  IonSearchbar,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon,
  onIonViewWillEnter,
  onIonViewWillLeave
} from '@ionic/vue'
import { arrowUp } from 'ionicons/icons'

const route = useRoute()
const router = useRouter()

const store = useCustomListsStore()

const wordsInput = ref('')
const clearButtonMode = computed(() => {
  return isLoading.value ? 'never' : 'focus'
})
const isLoading = ref(false)
const submissionError = ref('')
const newlyCreatedParagraph = ref('')

const createListWithParagraph = (words: string[], allLists: List[], paragraph: string) => {
  const newListObject: List = {
    listNumber: allLists.length === 0 ? 1 : allLists[allLists.length - 1].listNumber + 1,
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

const createListWithSentences = (wordObjects: WordObject[], allLists: List[]) => {
  const newListObject: List = {
    listNumber: allLists.length === 0 ? 1 : allLists[allLists.length - 1].listNumber + 1,
    status: 'LIST_NOT_STARTED',
    paragraph: '',
    words: {}
  }
  console.log(wordObjects)

  wordObjects.forEach((word) => {
    newListObject.words[word.word] = {
      sentences: word.sentences,
      attempts: 1,
      attemptsSuccessful: 0
    }
  })
  console.log(newListObject)

  allLists.push(newListObject)
}

// TODO add error-handling in here for openai
const submitWords = async (words: string) => {
  try {
    if (!words) return (submissionError.value = 'Please enter at least one word')

    submissionError.value = ''

    const wordsArray = words.trim().toLowerCase().replace(/^,|,$/g, '').split(/[ ,]+/)
    const uniqueWordsArray = [...new Set(wordsArray)]
    if (uniqueWordsArray.length > 7) return (submissionError.value = 'Please enter at MOST 7 words')

    isLoading.value = true
    wordsInput.value = 'Creating list...'

    if (uniqueWordsArray.length > store.minWordsThreshold) {
      newlyCreatedParagraph.value = await useOpenAiParagraphGenerator(uniqueWordsArray)

      createListWithParagraph(uniqueWordsArray, store.allLists, newlyCreatedParagraph.value)
    } else {
      const wordsWithSentences = await useSentencesCreationAndStorage(
        uniqueWordsArray,
        'custom-list'
      )
      console.log(wordsWithSentences)
      if (wordsWithSentences) createListWithSentences(wordsWithSentences, store.allLists)
    }
    await store.updateListsInFirestore()

    wordsInput.value = ''
    isLoading.value = false
    setToastOpen('Uploaded list')
    // REVIEW uncomment below if I want to automatically direct the user to a list right after generating it
    // router.push({ params: { id: store.allLists.length } })
  } catch (err) {
    console.log(err)
    isLoading.value = false
    submissionError.value = 'Oops! Something went wrong. Please try again.'
  }
}

// const getNextListNumber = (allLists) => {
//   if (allLists.length === 0) {
//     return 1
//   }

//   const lastList = allLists[allLists.length - 1]
//   return lastList.listNumber + 1
// }

const toastMessage = ref('')
const setToastOpen = (message: string) => {
  toastMessage.value = message
}

const isVisible = ref(false)
const scrollTrigger = ref<HTMLElement | null>(null)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    isVisible.value = !entry.isIntersecting
  })
})

const content = ref<HTMLElement | null>(null)
const scrollToTop = () => {
  // @ts-ignore
  if (content.value) content.value.$el.scrollToTop(500)
}

const tabMounted = ref(false)
onMounted(() => {
  // check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // redirect to error component
    console.log(route.params)
    router.push('/not-found')
  }

  setTimeout(() => {
    tabMounted.value = true
  }, 1)
})

// NOTE regular vue 3 onActivated, deactivated, and beforeRouteUpdate seemingly don't work with either ionic's router outlet or its tabs, though they do with modals
onIonViewWillEnter(() => {
  // setTimeout is necessary to prevent fab from showing before the ref element ('scrollTrigger') is mounted
  setTimeout(() => {
    if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)
  }, 500)
})

onIonViewWillLeave(() => {
  observer.disconnect()
})
</script>

<style lang="scss" scoped>
// hr {
//   border: none;
//   height: 0.5px;
//   background-color: rgba(78, 78, 78, 0.623); // gray
//   margin: 1.5rem 0;
// }

// ion-button {
//   --background: #93e9be;
//   --border-radius: 8px;
// }

ion-content {
  --background: #eef9f8;
}

ion-toolbar {
  --display: flex;
  --justify-content: space-between;
  // --background: red;
}

ion-toast {
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  font-size: 15px;
}

.submit-form {
  display: flex;
  margin-bottom: 1.5rem;

  // row-gap: 2rem;

  .input-container {
    display: flex;
    flex-direction: column;
    width: 100%;

    label {
      margin-bottom: 0.5rem;
    }
  }
  // .input-field {
  //   display: flex;

  //   input {
  //     height: 35px;
  //     padding: 0.5rem;
  //     width: 100%;
  //   }

  //   button {
  //     width: 100px;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //   }
  // }
}

.error {
  margin-top: 1rem;
  // color: hsl(2, 65%, 54%);
  color: var(--orange-color);
}

.scroll-trigger {
  height: 800px;
  position: absolute;
  visibility: hidden;

  @media (min-width: 1024px) {
    height: 2400px;
  }
}

body.dark {
  ion-content {
    --background: rgb(32, 32, 32);
  }

  ion-searchbar {
    --background: rgb(40, 40, 40);
  }

  .input-container {
    label {
      color: rgb(196, 196, 196);
    }
  }
}

// .loading-container {
//   margin: 1.5rem;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// }

@media (min-width: 1024px) {
  .submit-form {
    margin-bottom: 3rem;
  }
}
</style>
