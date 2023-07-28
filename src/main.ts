import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { auth } from './firebaseInit'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { IonicVue } from '@ionic/vue'

import './styles/tailwind.css'
import './styles/main.css'

/* Required CSS for apps built with Ionic */
import '@ionic/vue/css/core.css'
/* Recommended CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional Ionic CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import ListGroups from '@/components/ListGroups.vue'
import WordDrill from '@/components/WordDrill.vue'

let app: ReturnType<typeof createApp>

// NOTE necessary for clearing the state after user logs out
auth.onAuthStateChanged((user) => {
  console.log('User', user)
  if (!app) {
    app = createApp(App)
      .use(createPinia())
      // remove mode option to use platform-specific styles
      .use(IonicVue, {
        // mode: 'ios',
        mode: 'md',
        // hardwareBackButton: false, // ineffective
        swipeBackEnabled: false // does not disable Safari's built-in swipe to go back, but it will at least prevent ionic's swipe to go back from triggering (if both trigger then there will be buggy behavior)
      })
      .component('RecycleScroller', RecycleScroller)
      // NOTE eager loading here eliminates lag when navigating between tabs
      .component('ListGroups', ListGroups)
      .component('WordDrill', WordDrill)
      .use(router)

    app.mount('#app')
  }
})
