<template>
  <ion-icon
    @click="toggleDarkMode"
    :icon="isDarkModeEnabled ? sunny : moon"
    class="cursor-pointer text-lg"
    aria-label="Switch between dark and light mode"
  ></ion-icon>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core'
import { IonIcon } from '@ionic/vue'
import { moon, sunny } from 'ionicons/icons'

// const isDarkModeEnabled = ref(false)
const isDarkModeEnabled = useLocalStorage('dark-mode', false)

const toggleDarkMode = () => {
  isDarkModeEnabled.value = !isDarkModeEnabled.value
  document.body.classList.toggle('dark', isDarkModeEnabled.value)
}
</script>
