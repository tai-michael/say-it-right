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

      <button
        slot="end"
        class="widescreen"
        @click="toggleDarkMode"
        aria-label="Switch between dark and light mode"
      >
        <ion-icon
          :icon="isDarkModeEnabled ? sunny : moon"
          class="mr-2"
          aria-label="Switch between dark and light mode"
        ></ion-icon
        ><span class="button-text">Toggle darkmode</span>
      </button>

      <button slot="end" class="widescreen mr-2" @click="authButtonConfig.onClick">
        <ion-icon :icon="authButtonConfig.icon" class="mr-2"></ion-icon
        ><span class="button-text">{{ authButtonConfig.text }}</span>
      </button>

      <!-- <DarkModeToggle slot="end" class="mr-3" /> -->
      <button
        :icon="ellipsisHorizontalSharp"
        slot="end"
        class="text-2xl narrowscreen"
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
      <ion-list class="pb-2 pt-2">
        <ion-item :detail="false" lines="full" @click.stop class="cursor-default">
          <ion-icon :icon="personOutline" class="cursor-pointer text-xl mr-2 ml-[-1px]"></ion-icon>
          Signed in as&nbsp;<span class="font-medium">{{ user?.displayName }}</span>
        </ion-item>

        <ion-item
          :button="true"
          :detail="false"
          lines="full"
          @click="toggleDarkMode"
          class="cursor-pointer"
        >
          <ion-icon
            :icon="isDarkModeEnabled ? sunny : moon"
            class="text-lg mr-2"
            aria-label="Switch between dark and light mode"
          ></ion-icon
          >{{ isDarkModeEnabled ? 'Turn off darkmode' : 'Turn on darkmode' }}
        </ion-item>

        <ion-item
          :button="true"
          :detail="false"
          lines="none"
          class="pt-1 cursor-pointer"
          @click="authButtonConfig.onClick"
        >
          <ion-icon :icon="authButtonConfig.icon" class="text-xl mr-2"></ion-icon
          >{{ authButtonConfig.text }}</ion-item
        >
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
  personOutline,
  moon,
  sunny,
  logOutOutline,
  logInOutline
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
import { isAuthenticated, user } from '@/firebaseInit'
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
      onClick: signInUser,
      icon: logInOutline,
      text: 'Sign in'
    }
  }
})

const signInUser = () => {
  router.push('/sign-in')
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

  // --background: #8ed6ce;
  // --background: #3bb3ac;
  --background: #36a39c;
  // --background: #31928c;

  ion-icon {
    color: rgb(231, 253, 243);
  }

  ion-title {
    // --color: rgb(231, 253, 243);
    --color: white;
    @media screen and (min-width: 768px) {
      font-size: 1.15rem;
      font-weight: 400;
    }
  }

  display: flex;
  height: 100%;

  button {
    display: flex !important;
    align-items: center !important;
    height: 100%;
    padding: 0 0.75rem;
    background-color: transparent;
    transition: background-color 0.3s;

    ion-icon {
      height: 24px;
      width: 24px;
    }

    @media only screen and (min-width: 480px) and (max-width: 850px) {
      padding-right: 0.25rem;
    }
  }

  button:hover,
  button:active {
    // background-color: rgb(240, 240, 240);
    background-color: #3bb3ac;
  }

  ion-progress-bar {
    --background: #a5bbfa;
    // --progress-background: #3d8bff;
    --progress-background: #4255ff;
  }
}

.narrowscreen {
  display: none !important;
}

.widescreen {
  display: flex !important;
}

.button-text {
  color: white;
  font-size: 1rem;
  // padding-right: 1.5rem;

  @media screen and (max-width: 850px) {
    display: none !important;
  }
}

/* Mobile devices */
@media screen and (max-width: 481px) {
  .narrowscreen {
    display: flex !important;
  }
  .widescreen {
    display: none !important;
  }
}

/* widescreen devices */
@media screen and (min-width: 480px) {
  .narrowscreen {
    display: none;
  }
  .widescreen {
    display: inline-block;
  }
}

@media only screen and (min-width: 768px) {
  .header-md::after {
    background-image: none !important;
  }
}

body.dark ion-toolbar {
  --background: rgb(24, 24, 24);

  ion-title {
    --color: rgb(196, 196, 196);
  }

  .button-text {
    color: rgb(196, 196, 196);
  }

  ion-icon {
    color: rgb(196, 196, 196);
  }
  button:hover,
  button:active {
    background-color: rgb(32, 32, 32);
  }

  @media only screen and (min-width: 768px) {
    border-bottom: 1px rgb(43, 43, 43) solid;
  }
}

// ion-item {
//   --inner-padding-bottom: 2px;
// }
</style>
