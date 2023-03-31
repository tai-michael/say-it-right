<template>
  <main>
    <div>Word Test</div>
    <div>{{ store.mispronouncedTestedWords[0] }}</div>
    <button @click="play">Speaker icon</button>
    <button @click="store.wordTestCompleted = true">Next</button>
  </main>
</template>

<script setup>
import useConvertTextToSpeech from '@/composables/useConvertTextToSpeech.js'
import { useSuggestedListStore } from '@/stores/suggested'
const store = useSuggestedListStore()

const play = () => {
  useConvertTextToSpeech('Espresso.', 'male')
}
</script>
