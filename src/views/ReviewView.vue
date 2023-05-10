<template>
  <!-- <h4>Review</h4> -->
  <main>
    <ul class="list">
      <li
        v-for="(entry, index) in allWords"
        :key="index"
        @click="selectWord(entry)"
        class="list__row"
      >
        <!-- TODO replace with router-link -->
        {{ entry.word }}
      </li>
    </ul>
    <hr v-if="Object.keys(allWords).length < 10" />
    <!-- TODO replace with SingleWordChallenge -->
    <div class="word-drill">
      <keep-alive>
        <WordDrill :word="selectedWord" v-if="selectedWord" :key="selectedWord.word" />
      </keep-alive>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import WordDrill from '@/components/WordDrill.vue'
import type { WordObject } from '@/stores/modules/types/Review'
// import type { WordObject } from '@/stores/modules/types/Review'
import { useReviewStore } from '@/stores/index.ts'

const store = useReviewStore()
const { allWords } = storeToRefs(store)

const selectedWord: Ref<WordObject | null> = ref(null)

const selectWord = (word: WordObject) => {
  selectedWord.value = word
  localStorage.setItem('selectedWord', word.word)
}

onMounted(() => {
  const word = localStorage.getItem('selectedWord')
  if (word) {
    selectedWord.value = allWords.value.find((w) => w.word === word) ?? null
  }
})
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: row;
}
h4 {
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}
.list {
  padding: 0.5rem 1rem;
  line-height: 2;
  li {
    list-style: none;
  }
  max-height: 280px;
  overflow-y: auto;
  min-width: 140px;

  &__row {
    cursor: pointer;
  }
}
.word-drill {
  padding: 2rem 1rem 0.5rem;
  min-width: 380px;
  max-width: 380px;
}
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(197, 197, 197);
}
</style>
