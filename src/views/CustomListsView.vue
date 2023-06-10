<template>
  <ion-page>
    <TheHeader :is-loading="isLoading">Custom Lists</TheHeader>

    <ion-content class="ion-padding" ref="content">
      <div ref="scrollTrigger" class="scroll-trigger"></div>

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
          ></ion-searchbar>
          <!-- <ion-button v-if="isLoading" ><LoadingDots /></ion-button>
          <ion-button v-else type="submit" :disabled="isLoading" class="color">Submit</ion-button> -->
        </div>
      </form>

      <div v-if="submissionError" class="error">{{ submissionError }}</div>

      <ListGroups :route-name="route.name" @list-deleted="setToastOpen(true)" />

      <ion-toast
        :is-open="isToastOpen"
        message="List deleted"
        :duration="3000"
        @didDismiss="setToastOpen(false)"
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
import { ref, onMounted } from 'vue'
import { createOutline } from 'ionicons/icons'
import TheHeader from '@/components/TheHeader.vue'
import ListGroups from '@/components/ListGroups.vue'
import useOpenAiParagraphGenerator from '@/composables/useOpenAiParagraphGenerator'
import type { List } from '@/stores/modules/types/List'
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
    // NOTE if a list gets deleted, this works better than 'allLists.length + 1'
    listNumber: allLists[allLists.length - 1].listNumber + 1,
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

const isToastOpen = ref(false)
const setToastOpen = (state: boolean) => {
  isToastOpen.value = state
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

onMounted(() => {
  // check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // redirect to error component
    console.log(route.params)
    router.push('/not-found')
  }
})

// NOTE regular vue 3 onActivated, deactivated, and beforeRouteUpdate seemingly don't work with either ionic's router outlet or its tabs, though they do with modals
onIonViewWillEnter(() => {
  if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)
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
