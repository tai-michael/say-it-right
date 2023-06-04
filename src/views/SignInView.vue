<template>
  <ion-page>
    <ion-content>
      <div class="text-center">
        <div class="mt-10 mb-10 text-teal-600 text-3xl">Say It Right</div>
      </div>
      <div id="firebaseui-auth-container"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { auth } from '@/firebaseInit'
import firebase from 'firebase/compat/app'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { IonPage, IonContent } from '@ionic/vue'

onMounted(() => {
  const uiConfig = {
    // Redirect route; necessary if 'signInSuccessWithAuthResult' set to true
    // signInSuccessUrl: 'http://localhost:4000/custom-lists',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID
      // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // Setting this to false makes it so that page won't refresh after sign in
    callbacks: {
      signInSuccessWithAuthResult: () => false
      // uiShown: function () {
      //   // The widget is rendered.
      //   // Hide the loader.
      //   document.getElementById('loader').style.display = 'none'
      // }
    }
  }

  const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth)
  ui.start('#firebaseui-auth-container', uiConfig)

  // ui.disableAutoSignIn()
})
</script>

<style lang="scss">
// NOTE see https://github.com/firebase/firebaseui-web/issues/121

.mdl-card .firebaseui-callback-indicator-container {
  height: 2px;
}

.mdl-card.firebaseui-container {
  min-height: 2px;
}

.mdl-shadow--2dp {
  box-shadow: none;
}

.firebaseui-info-bar {
  margin-top: 20px;
}

div.mdl-progress::after {
  display: block;
  color: #48a1ff;
  margin: 50px auto;
  content: 'Authenticating...';
  text-align: center;
}

.mdl-progress > .progressbar {
  background-color: #48a1ff !important;
}

.mdl-progress > .bufferbar {
  background-image: linear-gradient(90deg, hsla(0, 0%, 100%, 0.7), hsla(0, 0%, 100%, 0.7)),
    linear-gradient(90deg, #48a1ff, #48a1ff) !important;
  z-index: 0;
  left: 0;
}

.mdl-progress:not(.mdl-progress--indeterminate) > .auxbar,
.mdl-progress:not(.mdl-progress__indeterminate) > .auxbar {
  background-image: linear-gradient(90deg, hsla(0, 0%, 100%, 0.9), hsla(0, 0%, 100%, 0.9)),
    linear-gradient(90deg, #48a1ff, #48a1ff) !important;
}

// .firebaseui-idp-button {
//   background-color: #6294ff !important;
//   color: white !important;
// }
</style>
