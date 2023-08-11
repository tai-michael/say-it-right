<template>
  <ion-header>
    <ion-toolbar>
      <a slot="start" class="logo flex items-center pl-4 pr-4 no-underline h-full" href="/">
        <!-- NOTE dynamic image sources work if placed in the public folder -->
        <!-- <img
          :src="`/images/${isDarkModeEnabled ? 'logo-dark' : 'logo-light'}.png`"
          alt="Logo"
          width="26"
          height="26"
        /> -->
        <img :src="isDarkModeEnabled ? logoDark : logoLight" alt="Logo" width="26" height="26" />
        <span class="ml-2 text-[white] text-lg font-medium">Say It Right</span>
      </a>

      <button
        v-if="props.showBackButton"
        @click="$emit('back-button-clicked')"
        router-direction="back"
        :router-animation="customLeaveAnimation"
        slot="start"
        class="narrowscreen-back-btn"
      >
        <ion-icon :icon="chevronBackOutline" class="text-2xl"></ion-icon>
      </button>
      <!-- <button
        v-if="props.showBackButton"
        @click="$emit('back-button-clicked')"
        router-direction="back"
        :router-animation="customLeaveAnimation"
        slot="start"
      >
        <ion-icon :icon="chevronBackOutline" class="text-2xl"></ion-icon>
      </button> -->
      <div slot="start" class="flex flex-row">
        <ion-title><slot></slot></ion-title>
        <button
          v-if="props.showBackButton"
          @click="$emit('back-button-clicked')"
          class="widescreen-back-btn text-[white] text-lg font-medium"
        >
          <!-- <ion-icon :icon="chevronBackOutline" class="text-2xl mr-2"></ion-icon> -->
          <ion-icon :icon="returnUpBackOutline" class="text-2xl mr-2"></ion-icon>
          Return to lists
        </button>
      </div>
      <!-- <ion-title><slot name="title">Default Title</slot></ion-title> -->
      <slot name="list"></slot>

      <!-- NOTE Widescreen buttons -->
      <button
        @click="toggleDarkMode"
        aria-label="Toggle darkmode"
        title="Toggle darkmode"
        slot="end"
        class="widescreen h-[80%]"
      >
        <ion-icon :icon="isDarkModeEnabled ? sunny : moon" class="text-2xl"></ion-icon>
      </button>
      <button
        @click.prevent="toggleWidescreenPopover"
        aria-label="User profile"
        title="User profile"
        slot="end"
        class="widescreen relative mr-2"
        :class="{ 'btn-active': showPopover }"
      >
        <ion-icon :icon="personCircleOutline" class="text-3xl"></ion-icon>
      </button>

      <!-- NOTE Narrowscreen ellipsis menu -->
      <button
        :icon="ellipsisHorizontalSharp"
        aria-label="Options"
        slot="end"
        class="narrowscreen text-2xl"
        @click.prevent="openNarrowscreenPopover($event)"
      >
        <ion-icon :icon="ellipsisHorizontalSharp"></ion-icon>
      </button>

      <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
    </ion-toolbar>

    <!-- NOTE Widescreen popover -->
    <ion-list v-if="showPopover" class="widescreen-popover pb-2 pt-2">
      <ion-item :detail="false" lines="full" @click.stop class="cursor-default">
        <ion-icon :icon="personCircleOutline" class="text-2xl mr-2 ml-[-2px]"></ion-icon>
        <span class="font-medium text-[14px]">{{ user?.displayName }}</span>
      </ion-item>

      <ion-item
        :button="true"
        :detail="false"
        lines="none"
        class="pt-1 cursor-pointer ml-[1px]"
        @click="authButtonConfig.onClick"
      >
        <ion-icon :icon="authButtonConfig.icon" class="text-xl mr-2"></ion-icon
        ><span class="text-[14px]">{{ authButtonConfig.text }}</span></ion-item
      >
    </ion-list>

    <!-- NOTE Narrowscreen popover -->
    <ion-popover
      :is-open="isPopoverOpen"
      :event="event"
      @didDismiss="isPopoverOpen = false"
      :dismiss-on-select="true"
    >
      <ion-list class="pb-2 pt-2">
        <ion-item :detail="false" lines="full" @click.stop class="cursor-default">
          <ion-icon
            :icon="personCircleOutline"
            class="cursor-pointer text-2xl mr-2 ml-[-2px]"
          ></ion-icon>
          <span class="font-medium">{{ user?.displayName }}</span>
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
            class="text-lg mr-2 ml-[1px]"
            aria-label="Switch between dark and light mode"
          ></ion-icon
          >{{ isDarkModeEnabled ? 'Turn off darkmode' : 'Turn on darkmode' }}
        </ion-item>

        <ion-item
          :button="true"
          :detail="false"
          lines="none"
          class="pt-1 cursor-pointer ml-[1px]"
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
import { ref, computed, inject, watch, onMounted } from 'vue'
// import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { customLeaveAnimation } from '@/components/transitions/CustomLeaveAnimation'
import {
  chevronBackOutline,
  returnUpBackOutline,
  ellipsisHorizontalSharp,
  personCircleOutline,
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
  IonList,
  IonItem
} from '@ionic/vue'
import { isAuthenticated, user } from '@/firebaseInit'
import { useAuthStore } from '@/stores/index.ts'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
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

// const logoDark = new URL('@/assets/images/logo-dark.png', import.meta.url).href
// const logoLight = new URL('@/assets/images/logo-light.png', import.meta.url).href

const logoDark = ref(null)
const logoLight = ref(null)

onMounted(() => {
  const logoDarkImage = new Image()
  logoDarkImage.src = new URL('@/assets/images/logo-dark.png', import.meta.url).href
  logoDark.value = logoDarkImage.src

  const logoLightImage = new Image()
  logoLightImage.src = new URL('@/assets/images/logo-light.png', import.meta.url).href
  logoLight.value = logoLightImage.src
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

// See https://ionicframework.com/docs/theming/dark-mode for application
const isDarkModeEnabled = inject('isDarkModeEnabled')
const toggleDarkMode = () => {
  isDarkModeEnabled.value = !isDarkModeEnabled.value
  document.body.classList.toggle('dark', isDarkModeEnabled.value)
}

// Code for popover
const isPopoverOpen = ref(false)
const event = ref(null)
// const openNarrowscreenPopover = (e, list: List) => {
//   event.value = e
//   selectedList.value = list
//   isPopoverOpen.value = true
// }
const openNarrowscreenPopover = (e) => {
  event.value = e
  isPopoverOpen.value = true
}

const showPopover = ref(false)
const toggleWidescreenPopover = () => {
  showPopover.value = !showPopover.value
}

// Prevents a unique popover for every view
watch(
  () => route.name,
  () => {
    showPopover.value = false
  }
)
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
    // 34px seems good for the avatar; maybe use last child or class selector
  }

  .logo {
    background-color: #2f8b86;
    border-right: 2px #2f8b86 solid;
    // @media screen and (max-width: 639px) {
    //   display: none;
    // }

    // span {
    //   @media screen and (max-width: 767px) {
    //     display: none;
    //   }
    // }
  }

  ion-title {
    --color: white;
    // --color: rgb(231, 253, 243);
    // @media screen and (min-width: 768px) {
    //   font-size: 1.15rem;
    //   font-weight: 400;
    // }
  }

  .widescreen-back-btn {
    width: 170px;
    // padding-right: 1rem;
    padding-right: 0.5rem;
    background-color: #5cc0b9;

    &:hover {
      background-color: #7dcdc5;
    }
  }

  display: flex;
  height: 100%;

  button {
    display: flex !important;
    align-items: center !important;
    height: 100%;
    // height: 80%;
    // border-radius: 4px;
    padding: 0 0.75rem;
    background-color: transparent;
    transition: background-color 0.3s;

    // @media only screen and (min-width: 481px) and (max-width: 850px) {
    //   padding-right: 0.25rem;
    // }

    @media screen and (min-width: 481px) {
      height: 2.65rem;
      width: 2.85rem;
      padding: 0.5rem;
      border-radius: 4px;
      justify-content: center;
    }
  }

  button:hover,
  .btn-active {
    // background-color: rgb(240, 240, 240);
    background-color: #3bb3ac;
  }

  ion-progress-bar {
    --background: #a5bbfa;
    // --progress-background: #3d8bff;
    --progress-background: #4255ff;
  }
}

.widescreen-popover {
  position: absolute;
  z-index: 20; // z-index of ion-toolbar is 10
  top: 90%;
  bottom: 0;
  right: 0;
  width: 250px;
  height: 115px;
  margin-right: 0.75rem;
  border-radius: 0.25rem;
  // box-shadow: 0 2px 6px 0 rgb(0, 0, 0, 0.35);
  box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
}

/* Default Styles for all screen sizes */
.narrowscreen {
  display: flex !important;
}

.logo,
.widescreen-back-btn {
  display: none !important;
}

.narrowscreen-back-btn {
  display: block;
}

.widescreen {
  display: none !important;
}

/* Non-mobile devices */
@media screen and (min-width: 481px) {
  .narrowscreen-back-btn {
    margin-left: 0.5rem;
  }
  .widescreen {
    display: flex !important;
  }

  .widescreen-popover {
    display: block !important;
  }

  .narrowscreen,
  ion-popover {
    display: none !important;
  }

  .widescreen {
    display: inline-block;
  }
}

@media only screen and (min-width: 768px) {
  .header-md {
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .narrowscreen-back-btn {
    display: none !important;
  }

  .logo,
  .widescreen-back-btn {
    display: flex !important;
  }
}

body.dark ion-toolbar {
  --background: rgb(24, 24, 24);
  border-bottom: 1px rgb(43, 43, 43) solid;

  .logo {
    // background: rgb(32, 32, 32);
    background: rgb(24, 24, 24);
    border-right: 2px rgb(43, 43, 43) solid;
  }

  ion-title {
    --color: rgb(196, 196, 196);
  }

  .widescreen-back-btn {
    background-color: rgb(43, 43, 43);

    &:hover {
      background-color: rgb(50, 50, 50);
    }
  }

  ion-icon {
    color: rgb(196, 196, 196);
  }
  button:hover,
  .btn-active {
    background-color: rgb(43, 43, 43);
  }
}

body.dark .widescreen-popover {
  background: rgb(35, 35, 35);
  border: 1px rgb(49, 49, 49) solid;

  ion-item {
    --background: rgb(35, 35, 35);
  }

  ion-item:first-child {
    border-bottom: 1px rgb(49, 49, 49) solid;
  }
}

// ion-item {
//   --inner-padding-bottom: 2px;
// }
</style>
