<template>
  <main>
    <div>Word Test</div>
    <div>{{ testedWord }}</div>
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

    <button @click="store.wordChallengeCompleted = true">Next</button>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import RecorderButton from './RecorderButton.vue'
import useConvertTextToSpeech from '@/composables/useConvertTextToSpeech.js'

import { useRoute } from 'vue-router'
import { useProvidedListsStore } from '@/stores/providedLists'
import { useCustomListsStore } from '@/stores/customLists'

const route = useRoute()
const store = route.name === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()

const props = defineProps({
  list: { type: Object, required: true }
})

// TODO should probably make this and testedWord onMounted instead, b/c i don't want the word to change automatically after its answered right, and I want a new instance of this component every time
// const mispronouncedTestedWords = computed(() => {
//   const list = store.allLists.find((list) => list.listNumber === props.id)
//   return list.words
//     .filter((wordObj) => wordObj.attempts > 0 && wordObj.attemptsSuccessful === 0)
//     .map((wordObj) => wordObj.word)
// })

// TODO probably replace this with emit from paragraph, as below might cause the instances to all show the same list (maybe)
const mispronouncedTestedWords = ref([])

onMounted(() => {
  // REVIEW spreading it like this will cause it to lose reactivity, which I might not want if I'm going to use the splice method to get the next word
  mispronouncedTestedWords.value = [
    ...Object.keys(props.list.words).filter(
      (word) =>
        store.activeList.words[word].attempts > 0 &&
        store.activeList.words[word].attemptsSuccessful === 0
    )
  ]
})

// const mispronouncedTestedWords = computed(() => {
//   return Object.keys(store.activeList.words).filter((word) => {
//     return (
//       store.activeList.words[word].attempts > 0 &&
//       store.activeList.words[word].attemptsSuccessful === 0
//     )
//   })
// })

const testedWord = computed(() => mispronouncedTestedWords.value[0])

const play = () => {
  useConvertTextToSpeech('Espresso.', 'male')
}

let isRecording = ref(false)
let testComplete = ref(false)

let temporaryTranscript = ref('')
const handleTempTranscriptRender = (transcript) => {
  temporaryTranscript.value = transcript
}

let finalTranscript = ref('')
const handleFinalTranscript = (transcript) => {
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
