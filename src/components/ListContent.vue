<template>
  <TheHeader :show-back-button="true" @back-button-clicked="returnToLists">{{ title }}</TheHeader>

  <ion-content>
    <PullRefresher />
    <TransitionAppear>
      <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />
      <WordChallenge v-else-if="showWordChallenge" :list="list" />

      <div v-else-if="list.status === 'LIST_COMPLETE'" class="message ion-padding">
        <div class="message__text flex flex-col">
          <span class="mb-5">{{ $t('list_content.message1') }}</span>
          <span class="mb-4">{{ $t('list_content.message2') }}</span>
          <ul v-if="locale === 'ja'">
            <li>
              {{ $t('list_content.message3') }}
              <RouterLink to="/review" class="link">{{ $t('list_content.message4') }}</RouterLink>
            </li>
            <li>
              {{ $t('list_content.message5') }}
              <span @click="returnToLists" class="link"> {{ $t('list_content.message6') }}</span>
            </li>
            <li>
              {{ $t('list_content.message9')
              }}<span @click="handleReset" class="link">{{ $t('list_content.message10') }}</span>
            </li>
          </ul>
          <ul v-else>
            <li>
              <RouterLink to="/review" class="link" routerDirection="none">{{
                $t('list_content.message3')
              }}</RouterLink
              >{{ $t('list_content.message4') }}
            </li>
            <li>
              <span @click="returnToLists" class="link">
                {{ `${routeName === 'custom-lists' ? $t('list_content.message5') : ''}` }}
                {{ $t('list_content.message6') }}</span
              >
              {{ $t('list_content.message7') }}
            </li>
            <li>
              {{ $t('list_content.message8')
              }}<span @click="handleReset" class="link">{{ $t('list_content.message9') }}</span
              >{{ $t('list_content.message10') }}
            </li>
          </ul>
        </div>
      </div>
    </TransitionAppear>
  </ion-content>
</template>

<script setup lang="ts">
import { computed, toRefs, defineAsyncComponent } from 'vue'
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import TheHeader from '@/components/TheHeader.vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
const ParagraphChallenge = defineAsyncComponent(() => import('@/components/ParagraphChallenge.vue'))
const WordChallenge = defineAsyncComponent(() => import('@/components/WordChallenge.vue'))
import TransitionAppear from '@/components/transitions/TransitionFade.vue'
import { IonContent } from '@ionic/vue'
import { useCustomListsStore, useProvidedListsStore } from '@/stores/index.ts'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const router = useRouter()
// const ParagraphChallenge = defineAsyncComponent({
//   // the loader function
//   loader: () => import('@/components/ParagraphChallenge.vue'),

//   // A component to use while the async component is loading
//   loadingComponent: LoadingSpinner,
//   // Delay before showing the loading component. Default: 200ms.
//   delay: 0
// })

const props = defineProps({
  list: { type: Object as PropType<List>, required: true },
  routeName: { type: String, required: true }
})
const { list, routeName } = toRefs(props)

const store = routeName.value === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()
const customListsStore = useCustomListsStore()

const showParagraphChallenge = computed(
  () =>
    Object.keys(list.value).length &&
    ((list.value?.status === 'LIST_NOT_STARTED' && list.value?.paragraph) ||
      list.value?.status === 'PARAGRAPH_RECORDING_ENDED')
)

// NOTE short custom lists will only have Word and Sentence Challenges, and will not contain a paragraph
const showWordChallenge = computed(
  () =>
    Object.keys(list.value).length &&
    ((list.value?.status === 'LIST_NOT_STARTED' && !list.value?.paragraph) ||
      list.value?.status === 'TESTING_WORD_ONLY' ||
      list.value?.status === 'TESTING_SENTENCES')
)

const returnToLists = () => {
  store.setActiveId(null)
  router.push({ name: routeName.value })
}

const handleReset = () => {
  // NOTE lists containing only sentences need to be reset differently than ones with paragraphs
  if (Object.keys(list.value.words).length > customListsStore.minWordsThreshold) store.resetList()
  else resetShortList()
}

const resetShortList = () => {
  const words = list.value.words
  Object.keys(words).forEach((word) => {
    words[word].attempts = 1
    words[word].attemptsSuccessful = 0
  })

  store.setListStatus('TESTING_WORD_ONLY')
  store.updateListsInFirestore()
}

const title = computed(
  () =>
    `${
      routeName.value === 'provided-lists' ? t('premade_lists.heading') : t('custom_lists.heading')
    } ${list.value.listNumber}`
)
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  justify-content: center;
  // margin-top: 2rem;
  // min-height: 64px;
  margin-top: 2rem;
  // height: 50px;
  // font-weight: 600;
  color: rgb(80, 80, 80);

  li:not(:last-child) {
    padding-bottom: 2rem;
  }

  // &__text {
  //   display: flex;
  //   flex-direction: column;
  //   row-gap: 1rem;
  //   span {
  //   }
  // }
}

body.dark {
  .message {
    color: rgb(196, 196, 196);
  }
}

.link {
  color: rgb(84, 150, 226);
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  text-decoration: underline;

  &:hover {
    // background-color: hsla(202, 100%, 37%, 0.1);
    color: rgb(126, 185, 253);
  }
}

.fade-appear-from,
.fade-appear-to {
  opacity: 0;
}
.fade-appear-active {
  transition: opacity 1s;
}

.loading-container {
  margin: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
