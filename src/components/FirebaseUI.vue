<template>
  <div id="firebaseui-auth-container"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { auth } from '@/firebaseInit'
import firebase from 'firebase/compat/app'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

onMounted(() => {
  // console.log('Sign in view mounted')
  const uiConfig = {
    // Redirect route; necessary if 'signInSuccessWithAuthResult' set to true
    // signInSuccessUrl: 'http://localhost:4000/custom-lists',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      // Setting this to false makes it so that page won't refresh after sign in
      signInSuccessWithAuthResult: () => false
      // uiShown: function () {
      //   // The widget is rendered.
      //   // Hide the loader.
      //   // console.log('uiShown') // set breakpoint to inspect loading bar
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
.firebaseui-container {
  background-color: #eef9f8;
}

.firebaseui-card-header {
  border-bottom: none;
}

body.dark {
  .firebaseui-container {
    background-color: rgb(32, 32, 32);
  }

  .firebaseui-title,
  .firebaseui-label,
  .firebaseui-textfield.mdl-textfield .firebaseui-input,
  .firebaseui-input-invalid,
  .firebaseui-id-secondary-link {
    color: white !important;
  }

  .firebaseui-textfield.mdl-textfield .firebaseui-input {
    border-color: white;
  }

  .mdl-textfield__input {
    border-bottom: 1px solid white;
  }
}

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

// div.mdl-progress::after {
//   display: block;
//   color: #48a1ff;
//   margin: 50px auto;
//   content: 'Authenticating...';
//   text-align: center;
// }

.mdl-progress > .progressbar {
  background-color: #25c7b1 !important;
}

// .mdl-progress > .bufferbar {
//   background-image: linear-gradient(90deg, hsla(0, 0%, 100%, 0.7), hsla(0, 0%, 100%, 0.7)),
//     linear-gradient(90deg, #25c7b1, #25c7b1) !important;
//   z-index: 0;
//   left: 0;
// }

// .mdl-progress:not(.mdl-progress--indeterminate) > .auxbar,
// .mdl-progress:not(.mdl-progress__indeterminate) > .auxbar {
//   background-image: linear-gradient(90deg, hsla(0, 0%, 100%, 0.9), hsla(0, 0%, 100%, 0.9)),
//     linear-gradient(90deg, #25c7b1, #25c7b1) !important;
// }

// .firebaseui-idp-button {
//   background-color: #6294ff !important;
//   color: white !important;
// }
</style>
