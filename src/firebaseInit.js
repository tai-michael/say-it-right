import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useAuth } from '@vueuse/firebase/useAuth'

const firebaseConfig = {
  apiKey: 'AIzaSyCPd09-E1GP_GaSnpuHXQYSFyDbi-Pg-7U',
  authDomain: 'say-it-right-b0537.firebaseapp.com',
  projectId: 'say-it-right-b0537',
  storageBucket: 'say-it-right-b0537.appspot.com',
  messagingSenderId: '19396596713',
  appId: '1:19396596713:web:80102248e4f0e5394bf178'
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

const { isAuthenticated, user } = useAuth(auth)
export { isAuthenticated, user }
