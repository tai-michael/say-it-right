import 'firebase/compat/auth'
import firebase from 'firebase/compat/app'
import { useAuth } from '@vueuse/firebase/useAuth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)

const app = firebase.initializeApp(firebaseConfig)
export const auth = firebase.auth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

const { isAuthenticated, user } = useAuth(auth)
export { isAuthenticated, user }
