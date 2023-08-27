import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { auth } from './firebaseInit'
import * as Sentry from '@sentry/vue'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { IonicVue } from '@ionic/vue'
import { createI18n } from 'vue-i18n'
import messages from './translations/main'
import './styles/tailwind.css'
import './styles/main.css'

/* Required CSS for apps built with Ionic */
import '@ionic/vue/css/core.css'
/* Recommended CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
// import '@ionic/vue/css/typography.css'

/* Optional Ionic CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
// import '@ionic/vue/css/float-elements.css'
// import '@ionic/vue/css/text-alignment.css'
// import '@ionic/vue/css/text-transformation.css'
// import '@ionic/vue/css/flex-utils.css'
// import '@ionic/vue/css/display.css'

function checkDefaultLanguage(locale: string) {
  const supportedLanguages = ['en', 'zh-CN', 'ja'] // Add your supported languages here
  let matched = supportedLanguages.find((lang) => lang === locale)

  if (!matched) {
    const savedLocalePartials = savedLocale.split('-')[0]
    matched = supportedLanguages.find((lang) => lang === savedLocalePartials)
  }

  if (!matched) {
    const savedLocalePartials = savedLocale.split('-')[0]
    matched = supportedLanguages.find((lang) => lang.split('-')[0] === savedLocalePartials)
  }

  return matched || 'en'
}

const savedLocale = localStorage.getItem('locale') || navigator.language
const matchedLocale = checkDefaultLanguage(savedLocale)
const i18n = createI18n({
  legacy: false,
  locale: matchedLocale,
  // fallbackLocale: 'en',
  messages
})

let app: ReturnType<typeof createApp>

// NOTE necessary for clearing the state after user logs out
auth.onAuthStateChanged((user) => {
  console.log('User', user)
  if (!app) {
    app = createApp(App)

    if (import.meta.env.PROD) {
      Sentry.init({
        app,
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
          new Sentry.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router)
          }),
          new Sentry.Replay()
        ],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // REVIEW Sentry recommends adjusting this value in production
        tracesSampleRate: 1.0,

        // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ['https://say-it-right.netlify.app/'],
        // tracePropagationTargets: ['localhost', /^https:\/\/say-it-right\.app\/api/],

        // Capture Replay for 10% of all sessions,
        // plus for 100% of sessions with an error
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0
      })
    }

    app
      .use(createPinia())
      // remove mode option to use platform-specific styles
      .use(IonicVue, {
        // mode: 'ios',
        mode: 'md',
        // hardwareBackButton: false, // ineffective
        swipeBackEnabled: false // does not disable Safari's built-in swipe to go back, but it will at least prevent ionic's swipe to go back from triggering (if both trigger then there will be buggy behavior)
      })
      // .component('RecycleScroller', RecycleScroller)
      // .component('ListGroups', ListGroups)
      // .component('WordDrill', WordDrill)
      .use(router)
      .use(i18n)

    app.mount('#app')
  }
})
