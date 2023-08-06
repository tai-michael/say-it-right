import { ref } from 'vue'
import { defineStore } from 'pinia'

type DictionaryEntries = { [key: string]: string }

export const useIpaDictionaryStore = defineStore('ipaDict', () => {
  const ipaDictionary = ref<DictionaryEntries | null>(null)
  const hydrateDictionary = (dictionaryEntries: DictionaryEntries) => {
    ipaDictionary.value = dictionaryEntries
  }

  return {
    ipaDictionary,
    hydrateDictionary
  }
})
