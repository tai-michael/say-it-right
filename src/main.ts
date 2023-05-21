import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue'

import './assets/main.css'
import './styles/tailwind.css'
import '@ionic/vue/css/core.css'

import { auth } from './firebaseInit'

let app: ReturnType<typeof createApp>

// NOTE necessary for clearing the state after user logs out
auth.onAuthStateChanged((user) => {
  console.log('User', user)
  if (!app) {
    app = createApp(App).use(createPinia()).use(IonicVue).use(router)
    app.mount('#app')
  }
})
