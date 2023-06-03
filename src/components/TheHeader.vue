<template>
  <ion-header>
    <ion-toolbar>
      <slot name="list"></slot>
      <button
        v-if="props.showBackButton"
        @click="$emit('back-button-clicked')"
        router-direction="back"
        :router-animation="customLeaveAnimation"
        slot="start"
        class="bg-transparent"
        :class="{ 'dark-mode': isDarkModeEnabled }"
      >
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <ion-title><slot></slot></ion-title>
      <!-- <ion-title><slot name="title">Default Title</slot></ion-title> -->

      <!-- <DarkModeToggle slot="end" class="mr-3" /> -->
      <ion-icon
        :icon="ellipsisHorizontalSharp"
        slot="end"
        class="text-2xl pr-2"
        @click.prevent="openPopover($event)"
      ></ion-icon>

      <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
    </ion-toolbar>

    <ion-popover
      :is-open="isPopoverOpen"
      :event="event"
      @didDismiss="isPopoverOpen = false"
      :dismiss-on-select="true"
    >
      <!-- <ion-icon :icon="trashOutline" class="text-xl mr-2 align-middle"></ion-icon
        ><span class="align-middle mr-4">Delete list</span> -->
      <ion-list class="pb-2 pt-2 cursor-pointer">
        <ion-item :button="true" :detail="false" lines="full" @click="authButtonConfig.onClick">
          <ion-icon :icon="authButtonConfig.icon" class="text-xl mr-2"></ion-icon
          >{{ authButtonConfig.text }}</ion-item
        >

        <ion-item :button="true" :detail="false" lines="none" class="pt-1" @click="toggleDarkMode">
          <ion-icon
            :icon="isDarkModeEnabled ? sunny : moon"
            class="cursor-pointer text-lg mr-2"
            aria-label="Switch between dark and light mode"
          ></ion-icon
          >{{ isDarkModeEnabled ? 'Turn off darkmode' : 'Turn on darkmode' }}
        </ion-item>

        <!-- <ion-item :button="true" id="nested-trigger">More options...</ion-item>
          <ion-popover :dismiss-on-select="true" side="end">
            <ion-content>
              <ion-list>
                <ion-item :button="true" :detail="false">Nested option</ion-item>
              </ion-list>
            </ion-content>
          </ion-popover> -->
      </ion-list>
    </ion-popover>
  </ion-header>
</template>
<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { customLeaveAnimation } from '@/components/transitions/CustomLeaveAnimation'
import {
  chevronBackOutline,
  ellipsisHorizontalSharp,
  logOutOutline,
  logInOutline,
  moon,
  sunny
} from 'ionicons/icons'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonProgressBar,
  IonPopover,
  IonContent,
  IonList,
  IonItem
} from '@ionic/vue'
import { isAuthenticated } from '@/firebaseInit'
import { useAuthStore } from '@/stores/index.ts'

const store = useAuthStore()

const props = defineProps({
  showBackButton: {
    type: Boolean
  },
  isLoading: {
    type: Boolean
  }
})

const authButtonConfig = computed(() => {
  if (isAuthenticated.value) {
    return {
      onClick: store.signOutUser,
      icon: logOutOutline,
      text: 'Sign out'
    }
  } else {
    return {
      onClick: store.signInUser,
      icon: logInOutline,
      text: 'Sign in'
    }
  }
})

const isDarkModeEnabled = inject('isDarkModeEnabled')
const toggleDarkMode = () => {
  isDarkModeEnabled.value = !isDarkModeEnabled.value
  document.body.classList.toggle('dark', isDarkModeEnabled.value)
}

// Code for popover
const isPopoverOpen = ref(false)
const event = ref(null)
// const openPopover = (e, list: List) => {
//   event.value = e
//   selectedList.value = list
//   isPopoverOpen.value = true
// }
const openPopover = (e) => {
  event.value = e
  isPopoverOpen.value = true
}
</script>
<style lang="scss" scoped>
ion-toolbar {
  display: flex;
  max-height: 44px;
  padding: 0 0.2rem;
  align-items: center;
}

// ion-item {
//   --inner-padding-bottom: 2px;
// }

button {
  display: flex;
  padding: 0 0.3rem;

  ion-icon {
    height: 24px;
    width: 24px;
  }
}

button.dark-mode {
  color-scheme: dark;
}
</style>
