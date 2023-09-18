<template>
  <ion-page v-if="tabMounted">
    <TheHeader :is-loading="isLoadingNewList">{{ $t('custom_lists.heading', 2) }}</TheHeader>

    <ion-content class="ion-padding" ref="content">
      <PullRefresher />
      <div ref="scrollTrigger" class="scroll-trigger"></div>

      <div>
        <form class="submit-form" @submit.prevent="submitWords(wordsInput)">
          <div class="input-container">
            <label>{{ $t('custom_lists.create_list_instructions') }}</label>
            <div class="relative">
              <ion-searchbar
                :placeholder="`  ${$t('custom_lists.example')} urban thin kindly`"
                v-model="wordsInput"
                :disabled="isLoadingNewList"
                animated="true"
                inputmode="text"
                :show-clear-button="clearButtonMode"
                @ion-input="submissionError = ''"
                class="custom-lists"
              ></ion-searchbar>
              <button
                @click.prevent="submitWords(wordsInput)"
                :disabled="!wordsInput || isLoadingNewList"
                class="submit-btn cursor-pointer disabled:opacity-40 disabled:cursor-default"
                :title="$t('custom_lists.create_list')"
              >
                <ion-icon
                  v-if="!isLoadingNewList"
                  :icon="arrowForwardOutline"
                  class="text-xl"
                ></ion-icon>
                <ion-spinner name="lines-sharp" v-else></ion-spinner>
              </button>
            </div>
            <div
              v-if="submissionError"
              class="mt-4 ml-2 text-red-500 font-medium flex leading-[1.6rem]"
            >
              <ion-icon :icon="alertCircle" class="text-2xl mr-1"></ion-icon>{{ submissionError }}
            </div>
          </div>
        </form>

        <ListGroups
          v-if="store.allLists.length"
          :route-name="'custom-lists'"
          @list-deleted="setToastOpen('Deleted list')"
        />

        <div
          v-else
          class="instructions flex flex-col h-full w-full mt-24 justify-center align-middle items-center gap-y-3 p-2 font-semibold md:mt-20"
        >
          <span class="max-w-xs text-center">{{ $t('custom_lists.introduction1') }}</span>
          <span class="max-w-xs text-center">{{ $t('custom_lists.introduction2') }}</span>
        </div>
      </div>

      <ion-toast
        :is-open="isToastOpen"
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

  <!-- <ion-page v-else class="max-h-[100vh] h-full justify-center items-center"> -->
  <ion-page v-else>
    <TheHeader>{{ $t('custom_lists.heading', 2) }}</TheHeader>
    <ion-content>
      <LoadingSpinner />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { arrowForwardOutline } from 'ionicons/icons'
import TheHeader from '@/components/TheHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
const ListGroups = defineAsyncComponent(() => import('@/components/ListGroups.vue'))
// import ListGroups from '@/components/ListGroups.vue'
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
  IonSpinner,
  onIonViewDidEnter,
  onIonViewWillLeave
} from '@ionic/vue'
import { arrowUp, alertCircle } from 'ionicons/icons'

const route = useRoute()
const router = useRouter()

const store = useCustomListsStore()

const wordsInput = ref('')
const clearButtonMode = computed(() => {
  return isLoadingNewList.value ? 'never' : 'focus'
})
const isLoadingNewList = ref(false)
const submissionError = ref('')
const newlyCreatedParagraph = ref('')

const createListWithParagraph = (words: string[], allLists: List[], paragraph: string) => {
  const newListObject: List = {
    listNumber: allLists.length === 0 ? 1 : allLists[allLists.length - 1].listNumber + 1,
    listTitle: '',
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
    listTitle: '',
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
    // if (!words) return (submissionError.value = 'Please enter at least one word')

    submissionError.value = ''

    const wordsArray = words.trim().toLowerCase().replace(/^,|,$/g, '').split(/[ ,]+/)
    const uniqueWordsArray = [...new Set(wordsArray)]
    if (uniqueWordsArray.length > 7) return (submissionError.value = 'Please enter at MOST 7 words')

    isLoadingNewList.value = true

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
    // TODO possibly force rerender or reload ReviewView or WordSelectModal here

    wordsInput.value = ''
    isLoadingNewList.value = false
    setToastOpen('Uploaded list')
    // REVIEW uncomment below if we want to automatically direct the user to a list right after generating it
    // router.push({ params: { id: store.allLists.length } })

    setTimeout(() => {
      searchIcon = document.querySelector('.searchbar-search-icon')
      if (searchIcon) {
        searchIcon.addEventListener('click', onSearchIconClick)
        searchIcon.addEventListener('touch', onSearchIconClick)
      }
    }, 600)
  } catch (err) {
    console.log(err)
    isLoadingNewList.value = false
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
const isToastOpen = ref(false)
const setToastOpen = (message: string) => {
  // NOTE closes preexisting toasts (i.e. resets duration toast is open)
  if (toastMessage.value) isToastOpen.value = false

  if (message)
    setTimeout(() => {
      isToastOpen.value = true
      toastMessage.value = message
    })
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
  // Check if any parameters were passed in the URL
  if (route.params.catchAll) {
    // Redirect to error component
    console.log(route.params)
    router.push('/not-found')
  }

  setTimeout(() => {
    tabMounted.value = true

    // Preloading these components reduces delay when ListCard is clicked;
    // Tested on iOS, Android, and desktop
    import('@/components/WordChallenge.vue')
    import('@/components/ParagraphChallenge.vue')
    import('@/components/ListContent.vue')
  }, 500)
})

const onSearchIconClick = () => {
  submitWords(wordsInput.value)
}

let searchIcon: HTMLElement | null
// NOTE regular vue 3 onActivated, deactivated, and beforeRouteUpdate seemingly don't work with either ionic's router outlet or its tabs, though they do with modals
onIonViewDidEnter(() => {
  // NOTE setTimeout is necessary to prevent fab from showing before the ref element ('scrollTrigger') is mounted
  setTimeout(() => {
    if (scrollTrigger.value !== null) observer.observe(scrollTrigger.value)

    searchIcon = document.querySelector('.searchbar-search-icon')
    if (searchIcon) {
      // console.log(searchIcon)
      searchIcon.addEventListener('click', onSearchIconClick)
      searchIcon.addEventListener('touch', onSearchIconClick)
    }

    // const searchInput = document.querySelector('.searchbar-input')
    // if (searchInput) {
    //   searchInput.style.paddingInlineEnd = '45px'
    // }
  }, 600)
})

onIonViewWillLeave(() => {
  observer.disconnect()

  if (searchIcon) {
    searchIcon.removeEventListener('click', onSearchIconClick)
    searchIcon.removeEventListener('touch', onSearchIconClick)
  }
})
</script>

<style lang="scss" scoped>
ion-content {
  --background: #eef9f8;

  @media only screen and (min-width: 481px) {
    --padding-start: 3rem;
    --padding-end: 3rem;
  }

  @media only screen and (min-width: 768px) {
    --padding-start: 8rem;
    --padding-end: 1rem;
  }
}

ion-toolbar {
  --display: flex;
  --justify-content: space-between;
  // --background: red;
}

ion-toast {
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --max-width: 300px;
  font-size: 15px;
}

.scroll-trigger {
  height: 800px;
  position: absolute;
  visibility: hidden;

  @media (min-width: 1024px) {
    height: 2400px;
  }
}

ion-spinner.mounting-spinner {
  // color: green;
  color: #25c7b1;
  height: 48px;
  width: 48px;
}

.submit-form {
  display: flex;
  margin-bottom: 1.5rem;
  // max-width: 1008px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  @media only screen and (min-width: 768px) {
    margin-top: 2rem;
  }

  // row-gap: 2rem;

  .input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;

    label {
      margin: 0.5rem;

      @media (min-width: 640px) {
        margin-bottom: 1.25rem;
      }
    }
  }

  .submit-btn {
    position: absolute;
    top: 11px;
    right: 11px;
    padding: 8px 9px 6px 8px;
    border-radius: 4px;
    color: white;
    background: #3bb8b1;
    transition-duration: 0.2s;
    transition-property: opacity;

    &:not(:disabled):hover {
      background: #3dc4bd;
    }

    ion-spinner {
      width: 20px;
      height: 20px;
      color: white;
    }
  }
}

.instructions {
  color: rgb(80, 80, 80);
}

ion-searchbar ion-icon {
  right: 16px !important;
  left: auto !important;
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

  .instructions {
    color: rgb(196, 196, 196);
  }

  .submit-btn {
    &:disabled {
      // background-color: transparent;
      opacity: 0.3;
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
