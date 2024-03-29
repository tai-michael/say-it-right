import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, user } from '@/firebaseInit'
import {
  // createUserWithEmailAndPassword,
  // signInWithEmailAndPassword,
  // GoogleAuthProvider,
  // getAdditionalUserInfo,
  // signInWithPopup,
  signOut
} from 'firebase/auth'
import { defineStore } from 'pinia'
import { useCustomListsStore, usePremadeListsStore } from '@/stores'

export const useAuthStore = defineStore('auth', () => {
  const premadeListsStore = usePremadeListsStore()
  const customListsStore = useCustomListsStore()
  const router = useRouter()

  const signOutUser = () => {
    premadeListsStore.setActiveId(null)
    customListsStore.setActiveId(null)
    localStorage.setItem('selectedWord', '')
    signOut(auth)
    router.push('/')
    // location.reload()
  }

  const signedInAsAdmin = computed(() => user.value?.email === import.meta.env.VITE_ADMIN_EMAIL)

  // NOTE Using firebaseUI instead
  // const signInUser = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, new GoogleAuthProvider())
  //     const user = auth.currentUser

  //     // NOTE if it's user's first time logging in, send premade lists from backend
  //     if (user && getAdditionalUserInfo(result)?.isNewUser) {
  //       const globalPremadeLists = await premadeListsStore.downloadAndExtractGlobalPremadeLists()

  //       await setDoc(doc(db, 'users', user.uid), {
  //         userName: user.displayName,
  //         customLists: [],
  //         premadeLists: globalPremadeLists,
  //         review: []
  //       })
  //     }

  //     console.log('user signed in')
  //     // NOTE after reload, lists will be hydrated in App.vue
  //     // location.reload()
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  return {
    signedInAsAdmin,
    signOutUser
    // signInUser,
  }
})

// export default {
//   namespaced: true,

//   state: {
//     user: null,
//     authMessage: '',
//     successfulAuth: null,
//     loginErrorMessage: '',
//     isAuthenticating: null
//   },

//   getters: {
//     loggedIn: (state) => state.user,
//     loginErrorMessage: (state) => state.loginErrorMessage,
//     authMessage: (state) => state.authMessage,
//     successfulAuth: (state) => state.successfulAuth,
//     isAuthenticating: (state) => state.isAuthenticating
//   },

//   mutations: {
//     SET_AUTH_MESSAGE(state, message) {
//       state.authMessage = message
//     },
//     CLEAR_AUTH_MESSAGE(state) {
//       state.authMessage = ''
//     },

//     SET_LOGIN_ERROR(state, message) {
//       state.loginErrorMessage = message
//     },
//     CLEAR_LOGIN_ERROR(state) {
//       state.loginErrorMessage = ''
//     },

//     SET_SUCCESSFUL_AUTH(state, message) {
//       state.successfulAuth = true
//       state.authMessage = message
//     },

//     // SET_USER(state, user) {
//     //   state.user = user;
//     // },
//     // CLEAR_USER(state) {
//     //   state.user = null;
//     // },

//     TOGGLE_AUTH_SPINNER(state, boolean) {
//       state.isAuthenticating = boolean
//     }
//   },

//   actions: {
//     async register({ commit, dispatch }, details) {
//       commit('TOGGLE_AUTH_SPINNER', true)
//       const { email, password } = details

//       try {
//         const cred = await createUserWithEmailAndPassword(auth, email, password)

//         await setDoc(doc(db, 'users', cred.user.uid), {
//           email: email,
//           uploadedRecipes: [],
//           bookmarks: []
//         })

//         // commit('TOGGLE_AUTH_SPINNER', false);
//         // commit(
//         //   'SET_SUCCESSFUL_AUTH',
//         //   'You have successfully signed up. You will soon be redirected.'
//         // );
//         // setTimeout(() => {
//         //   location.reload();
//         // }, 1500);
//         // commit('SET_USER', auth.currentUser);

//         const docRef = doc(db, 'users', rootState.auth.user.uid)
//         await updateDoc(docRef, {
//           uploadedRecipes: arrayUnion(exampleUserRecipe)
//         })
//       } catch (error) {
//         commit('TOGGLE_AUTH_SPINNER', false)
//         if (error.code === 'auth/email-already-in-use')
//           commit('SET_AUTH_MESSAGE', 'Email already in use')
//         if (error.code === 'auth/weak-password') commit('SET_AUTH_MESSAGE', 'Password too weak')
//         else commit('SET_AUTH_MESSAGE', 'Unable to register this email')
//       }
//     },

//     async login({ commit }, details) {
//       commit('TOGGLE_AUTH_SPINNER', true)
//       const { email, password } = details

//       try {
//         await signInWithEmailAndPassword(auth, email, password)

//         commit('TOGGLE_AUTH_SPINNER', false)
//         commit('SET_SUCCESSFUL_AUTH', 'You are now logged in. You will soon be redirected.')
//         setTimeout(() => {
//           location.reload()
//         }, 1500)
//         commit('SET_USER', auth.currentUser)
//       } catch (error) {
//         commit('TOGGLE_AUTH_SPINNER', false)
//         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password')
//           commit('SET_AUTH_MESSAGE', 'Incorrect username or password')
//         else if (error.code === 'auth/too-many-requests')
//           commit(
//             'SET_AUTH_MESSAGE',
//             'There have been too many login attempts. Please try again later.'
//           )
//         else commit('SET_AUTH_MESSAGE', 'Something went wrong')
//       }
//     },

//     // signOut() {
//     //   auth.signOut().then(() => {
//     //     this.$router.replace({ name: 'login' });
//     //   });
//     // },
//     async logout({ commit }) {
//       await signOut(auth)

//       commit('CLEAR_USER')

//       console.log(router)
//       // NOTE Include below only if we want user redirected to login or home
//       // router.push('login');

//       // router.push({
//       //   name: 'home',
//       // });

//       // Clears the URL
//       router.replace({
//         name: 'home',
//         query: { id: null, query: undefined }
//       })

//       location.reload()

//       // NOTE This line and location.reload() will keep the same search results and recipe view
//       // dispatch('home/init', null, { root: true });
//     }

//     // setupFirebase() {
//     //   auth.onAuthStateChanged(user => {
//     //     if (user) {
//     //       // User is signed in.
//     //       console.log('signed in');
//     //       this.loggedIn = true;
//     //     } else {
//     //       // No user is signed in.
//     //       this.loggedIn = false;
//     //       console.log('signed out', this.loggedIn);
//     //     }
//     //   });
//     // },

//     // // REVIEW The 'async' next to user below might not actually be necessary. Test this.
//     // fetchUser({ commit }) {
//     //   auth.onAuthStateChanged(async user => {
//     //     if (!user) {
//     //       commit('CLEAR_USER');
//     //     } else {
//     //       commit('SET_USER', user);

//     //       // // NOTE: isReady() is Vue 3 version of Vue 2's onReady
//     //       // if (
//     //       //   this.$router.isReady() &&
//     //       //   this.$router.currentRoute.value.path === '/login'
//     //       // ) {
//     //       //   this.$router.push('/');
//     //       // }
//     //     }
//     //   });
//     // },
//   }
// }
