import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { auth } from './firebaseInit'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { IonicVue } from '@ionic/vue'

import './styles/main.css'
import './styles/tailwind.css'

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

let app: ReturnType<typeof createApp>

// NOTE necessary for clearing the state after user logs out
auth.onAuthStateChanged((user) => {
  console.log('User', user)
  if (!app) {
    app = createApp(App)
      .use(createPinia())
      // remove mode option to use platform-specific styles
      .use(IonicVue, {
        mode: 'ios'
        // mode: 'md'
      })
      .use(VueVirtualScroller)
      .use(router)

    app.mount('#app')
  }
})
