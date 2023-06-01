<template>
  <ion-page>
    <TheHeader :show-back-button="true" @back-button-clicked="returnToLists"
      >{{ routeName === 'provided-lists' ? 'Provided List' : 'Custom List' }}
      {{ list.listNumber }}</TheHeader
    >

    <ion-content class="ion-padding">
      <TransitionAppear>
        <ParagraphChallenge v-if="showParagraphChallenge" :list="list" />

        <WordChallenge
          v-else-if="list.status === 'TESTING_WORD_ONLY' || list.status === 'TESTING_SENTENCES'"
          :list="list"
        />
      </TransitionAppear>

      <div v-if="list.status === 'LIST_COMPLETE'" class="message">
        <div class="message__text">
          <span>You have completed this list.</span>
          <span>
            We recommend that you <RouterLink to="/review" class="link">Review</RouterLink> the
            words you've learned!</span
          >
          <span
            >You can also <span @click="returnToLists" class="link">Create or Try</span> another
            list</span
          >
          <span>Or you can <span @click="store.resetList" class="link">Retry</span> this list</span>
        </div>
      </div>
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
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  justify-content: center;
  // margin-top: 2rem;
  min-height: 64px;
  padding: 0 5rem;
  // height: 50px;

  &__text {
    display: flex;
    flex-direction: column;
    span {
      padding-bottom: 0.5rem;
      font-weight: 600;
      color: var(--orange-color);
    }
  }
}

.link {
  color: rgb(84, 191, 226) !important;
  font-weight: 700 !important;
  cursor: pointer;
  transition: 0.4s;
  text-decoration: underline;
}

.link:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
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
