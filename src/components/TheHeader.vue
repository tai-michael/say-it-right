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
      >
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <ion-title><slot></slot></ion-title>
      <!-- <ion-title><slot name="title">Default Title</slot></ion-title> -->

      <!-- <DarkModeToggle slot="end" class="mr-3" /> -->
      <button
        :icon="ellipsisHorizontalSharp"
        slot="end"
        class="text-2xl"
        @click.prevent="openPopover($event)"
      >
        <ion-icon :icon="ellipsisHorizontalSharp"></ion-icon>
      </button>

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
import { ref, computed, inject, watch, useSlots } from 'vue'
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
import { useRouter } from 'vue-router'
const router = useRouter()

const store = useAuthStore()

const props = defineProps({
  showBackButton: {
    type: Boolean
  },
  isLoading: {
    type: Boolean
  }
})

// const slots = defineSlots()

// const title = computed(() => {
//   return slots.default()[0].children
// })

// watch(
//   () => title.value,
//   (newTitle) => {
//     document.title = newTitle
//   }
// )

const authButtonConfig = computed(() => {
  if (isAuthenticated.value) {
    return {
      onClick: store.signOutUser,
      icon: logOutOutline,
      text: 'Sign out'
    }
  } else {
    return {
      onClick: testFn,
      icon: logInOutline,
      text: 'Sign in'
    }
  }
})

// possibly replace store.signInUser with below, or delete it
const testFn = () => {
  router.push('/sign-in')
  // store.signInUser()
}

// see https://ionicframework.com/docs/theming/dark-mode for application
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
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;

  --background: #31928c;

  ion-icon {
    color: rgb(231, 253, 243);
  }

  ion-title {
    --color: rgb(231, 253, 243);
  }

  button {
    display: flex;
    padding: 0.6rem 0.75rem;
    background-color: transparent;
    transition: background-color 0.3s;

    ion-icon {
      height: 24px;
      width: 24px;
    }
  }

  button:hover,
  button:active {
    // background-color: rgb(240, 240, 240);
    background-color: #3bb3ac;
  }
}

body.dark ion-toolbar {
  --background: black;

  ion-icon {
    color: rgb(196, 196, 196);
  }

  ion-title {
    --color: rgb(196, 196, 196);
  }

  button {
    color-scheme: dark;
  }

  button:hover,
  button:active {
    background-color: rgb(39, 39, 39);
  }
}

// ion-item {
//   --inner-padding-bottom: 2px;
// }
</style>
