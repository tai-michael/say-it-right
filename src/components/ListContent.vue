<template>
  <ion-page>
    <TheHeader :show-back-button="true" @back-button-clicked="returnToLists">{{ title }}</TheHeader>

    <ion-content>
      <TransitionAppear>
        <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />

        <WordChallenge
          v-else-if="list.status === 'TESTING_WORD_ONLY' || list.status === 'TESTING_SENTENCES'"
          :list="list"
        />

        <div v-else-if="list.status === 'LIST_COMPLETE'" class="message ion-padding">
          <div class="message__text flex flex-col">
            <span class="mb-5">You've completed this list!</span>
            <span class="mb-4">You can: </span>
            <ul>
              <li>
                <RouterLink to="/review" class="link">Review</RouterLink> the words you've learned
              </li>
              <li>
                <span @click="returnToLists" class="link">
                  {{ `${routeName === 'custom-lists' ? 'Create or' : ''}` }} Try</span
                >
                another list
              </li>
              <li>Or <span @click="handleReset" class="link">Retry</span> this list</li>
            </ul>
          </div>
        </div>
      </TransitionAppear>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import TheHeader from '@/components/TheHeader.vue'
import ParagraphChallenge from '@/components/ParagraphChallenge.vue'
import WordChallenge from '@/components/WordChallenge.vue'
import TransitionAppear from '@/components/transitions/TransitionFade.vue'
import { useCustomListsStore, useProvidedListsStore } from '@/stores/index.ts'
import { RouterLink, useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
const router = useRouter()

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
    (list.value?.status === 'LIST_NOT_STARTED' ||
      list.value?.status === 'PARAGRAPH_RECORDING_ENDED')
)

const returnToLists = () => {
  store.setActiveId(null)
  router.push({ name: routeName.value })
}

const handleReset = () => {
  // NOTE lists containing only sentences need to be reset differently than ones with paragraphs
  if (Object.keys(list.value.words).length > customListsStore.minWordsThreshold) store.resetList
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
    `${routeName.value === 'provided-lists' ? 'Provided List' : 'Custom List'} ${
      list.value.listNumber
    }`
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
