<template>
  <main>
    <div>Word Test</div>
    <div>{{ testedWords[0] }}</div>
    <button @click="play">Speaker icon</button>

    <div v-if="isRecording && !testComplete" class="transcript-container">
      <label>Live transcript:</label>
      <div>{{ temporaryTranscriptDisplay }}</div>
    </div>

    <RecorderButton
      @recording-started="isRecording = true"
      @recording-stopped="handleFinalTranscript"
      @temporary-transcript-rendered="handleTempTranscriptRender"
      :challenge-status="props.list.status"
    />

    <button @click="store.setListStatus('SENTENCE_CHALLENGE_STARTED')">Next</button>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import RecorderButton from './RecorderButton.vue'
import useConvertTextToSpeech from '@/composables/useConvertTextToSpeech.ts'

import { useRoute } from 'vue-router'
import { useProvidedListsStore } from '@/stores/index.ts'
import { useCustomListsStore } from '@/stores/index.ts'

const route = useRoute()
const store = route.name === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

const props = defineProps({
  list: { type: Object, required: true }
})

// TODO should probably make this and testedWord onMounted instead, b/c i don't want the word to change automatically after its answered right, and I want a new instance of this component every time
// const testedWords = computed(() => {
//   const list = store.allLists.find((list) => list.listNumber === props.id)
//   return list.words
//     .filter((wordObj) => wordObj.attempts > 0 && wordObj.attemptsSuccessful === 0)
//     .map((wordObj) => wordObj.word)
// })

// TODO probably replace this with emit from paragraph, as below might cause the instances to all show the same list (maybe)
// const testedWords = ref<string[]>([])

const testedWords = computed(() => {
  const mispronouncedParagraphWords = Object.fromEntries(
    Object.entries(props.list.words).filter(
      ([word, wordObj]) => wordObj.attempts > 1 || wordObj.attemptsSuccessful === 0
    )
  )

  return Object.keys(mispronouncedParagraphWords).filter(
    (word) =>
      mispronouncedParagraphWords[word].attempts < 6 &&
      mispronouncedParagraphWords[word].attemptsSuccessful < 3
  )
})

const testedWord = computed(
  () => testedWords.value[0].slice(0, 1).toUpperCase() + testedWords.value[0].slice(1) + '.'
)

const play = () => {
  // NOTE with how Speechly works, adding '!' and making it all caps is necessary for higher volume and slower speed
  useConvertTextToSpeech(`!${testedWord.value.toUpperCase()}`, 'female')
  // useConvertTextToSpeech(testedWord.value, 'female')
}

const isRecording = ref(false)
const testComplete = ref(false)

const temporaryTranscript = ref('')
const handleTempTranscriptRender = (transcript: string) => {
  temporaryTranscript.value = transcript
}

const finalTranscript = ref('')
const handleFinalTranscript = (transcript: string) => {
  finalTranscript.value = transcript
}

const temporaryTranscriptDisplay = computed(() =>
  testComplete.value ? '' : temporaryTranscript.value?.split(' ').slice(-8).join(' ')
)
</script>

<style lang="scss" scoped>
.transcript-container {
  margin-top: 1rem;
  min-height: 64px;

  // position: fixed;
  // // top: 0;
  // left: 0;
  // right: 0;
  // // bottom: 1;
  // max-height: 100vh;
  // // padding: 3rem 0 0 0;
  // margin: 1rem 2rem;
  // // NOTE Probably needs to be lower, but test this first
  // max-width: 500px;
  // // z-index: 10;
}
</style>
