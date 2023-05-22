<template>
  <ion-icon
    @click="toggleDarkMode"
    :icon="isDarkModeEnabled ? sunny : moon"
    class="text-xl pr-1 cursor-pointer"
    aria-label="Switch between dark and light mode"
  ></ion-icon>
</template>

<script setup>
import { ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { moon, sunny } from 'ionicons/icons'

const isDarkModeEnabled = ref(false)

const toggleDarkMode = () => {
  isDarkModeEnabled.value = !isDarkModeEnabled.value
  document.body.classList.toggle('dark', isDarkModeEnabled.value)
}
</script>
