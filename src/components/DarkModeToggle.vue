<template>
  <ion-icon :icon="isDarkModeEnabled ? moon : sunny" class="mr-2"></ion-icon>
  <ion-toggle @ionChange="toggleDarkMode"></ion-toggle>
</template>

<script setup>
import { ref } from 'vue'
import { IonToggle, IonIcon } from '@ionic/vue'
import { moon, sunny } from 'ionicons/icons'

const isDarkModeEnabled = ref(false)

const toggleDarkMode = () => {
  isDarkModeEnabled.value = !isDarkModeEnabled.value
  document.body.classList.toggle('dark', isDarkModeEnabled.value)
}
</script>
