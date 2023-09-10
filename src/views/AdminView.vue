<template>
  <ion-page>
    <TheHeader>Admin</TheHeader>
    <ion-content class="ion-padding">
      <PullRefresher />
      <main v-if="authStore.signedInAsAdmin">
        <div class="upload">
          <label>Upload global core lists to firestore:</label>
          <ion-button @click="uploadCoreLists(coreLists)" :disabled="isLoading">Upload</ion-button>
          <!-- <ion-button @click="uploadList(newList)">Upload new list</ion-button> -->
        </div>

        <form class="submit-form" @submit.prevent="uploadList">
          <div class="input-container">
            <label>Upload new global list to firestore:</label>
            <div class="input-field">
              <input
                placeholder="Enter list number (e.g. 13)"
                pattern="\d+"
                v-model="listNumOfListToAdd"
              />
              <ion-button type="submit" :disabled="isLoading">Upload</ion-button>
            </div>
          </div>
        </form>

        <form class="submit-form" @submit.prevent="deleteList">
          <div class="input-container">
            <label>Delete global list from firestore:</label>
            <div class="input-field">
              <input
                placeholder="Enter list number (e.g. 13)"
                pattern="\d+"
                v-model="listNumOfListToDel"
              />
              <ion-button type="submit" :disabled="isLoading">Delete</ion-button>
            </div>
          </div>
        </form>

        <div class="mt-8">
          <ion-button @click="resetAllLists">Reset all lists</ion-button>
          <ion-button @click="resetCustomLists">Reset custom lists</ion-button>
          <ion-button @click="resetPremadeLists">Reset premade lists</ion-button>
          <ion-button @click="resetReview">Reset review</ion-button>
          <ion-button @click="hydrateReview">Hydrate review</ion-button>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
const PullRefresher = defineAsyncComponent(() => import('@/components/PullRefresher.vue'))
import coreLists from '@/assets/lists_1-12.json'
import type { WordObject, WordSource } from '@/stores/modules/types/Review'
import useWordObjCreator from '@/composables/useWordObjCreator'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { db, auth } from '@/firebaseInit'
import { doc, collection, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { usePremadeListsStore, useAuthStore, useReviewStore } from '@/stores/index.ts'

const premadeListsStore = usePremadeListsStore()
const reviewStore = useReviewStore()
const authStore = useAuthStore()
const router = useRouter()

const isLoading = ref(false)
const listNumOfListToDel = ref('')
const listNumOfListToAdd = ref('')

const uploadCoreLists = async (lists) => {
  console.log(lists)
  try {
    isLoading.value = true
    const batch = writeBatch(db)

    lists.forEach((list) => {
      const { listNumber } = list
      const listNumberWithZeros = addLeadingZeros(listNumber, 3)
      const listRef = doc(collection(db, 'global_premade_lists'), `${listNumberWithZeros}`)
      batch.set(listRef, list)
    })

    await batch.commit()
    isLoading.value = false
    console.log('Uploaded the core lists')
  } catch (err) {
    console.log(err)
    isLoading.value = false
  }
}

const uploadList = async () => {
  try {
    isLoading.value = true

    const listData = await import(`@/assets/new_global_lists/list_${listNumOfListToAdd.value}.json`)
    const adjustedListNumber = addLeadingZeros(listNumOfListToAdd.value, 3)
    await setDoc(doc(db, 'global_premade_lists', adjustedListNumber), listData.default)
    console.log(`Uploaded list_${listNumOfListToAdd.value}`)

    listNumOfListToAdd.value = ''
    isLoading.value = false
  } catch (err) {
    console.log(err)
    isLoading.value = false
  }
}

const deleteList = async () => {
  try {
    isLoading.value = true

    const adjustedListNumber = addLeadingZeros(listNumOfListToDel.value, 3)
    await deleteDoc(doc(db, 'global_premade_lists', adjustedListNumber))
    console.log(`Deleted list_${listNumOfListToDel.value}`)

    listNumOfListToDel.value = ''
    isLoading.value = false
  } catch (err) {
    console.log(err)
    isLoading.value = false
  }
}

const addLeadingZeros = (num, size) => {
  let str = num.toString()
  while (str.length < size) {
    str = '0' + str
  }
  return str
}

// TODO for testing purposes only; remove before production
const resetAllLists = async () => {
  console.log('Resetting...')
  if (!auth.currentUser) return

  const globalPremadeLists = await premadeListsStore.downloadAndExtractGlobalPremadeLists()

  await setDoc(doc(db, 'users', auth.currentUser.uid), {
    userName: auth.currentUser.displayName,
    customLists: [],
    premadeLists: globalPremadeLists,
    review: []
  })

  console.log('Resetted ALL the lists')
  location.reload()
}

const resetCustomLists = async () => {
  console.log('Resetting...')
  if (!auth.currentUser) return

  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
    customLists: []
  })
  console.log('Resetted the Custom lists')
  location.reload()
}

const resetPremadeLists = async () => {
  console.log('Resetting...')
  if (!auth.currentUser) return

  const globalPremadeLists = await premadeListsStore.downloadAndExtractGlobalPremadeLists()

  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
    premadeLists: globalPremadeLists
  })
  console.log('Resetted the Premade lists')
  location.reload()
}

const resetReview = async () => {
  console.log('Resetting...')
  if (!auth.currentUser) return

  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
    review: []
  })
  console.log('Resetted Review')
  location.reload()
}

const hydrateReview = async () => {
  const wordObjectsToAdd: WordObject[] = []

  for (let i = 0; i < premadeListsStore.allLists.length; i++) {
    const testedWords = [...Object.keys(premadeListsStore.allLists[i].words)]
    for (const word of testedWords) {
      // if (premadeListsStore.allLists[i].words.hasOwnProperty(word)) {
      const wordObject = useWordObjCreator(
        word,
        premadeListsStore.allLists[i].words[word].sentences,
        'premade-list' as WordSource
      )

      wordObjectsToAdd.push(wordObject)
      // }
    }
  }
  reviewStore.addWords(wordObjectsToAdd)
  reviewStore.updateReviewInFirestore()
  console.log('Hydrated Review with words')
}

// const uploadList = async (list) => {
//   try {
//     isLoading.value = true
//     const adjustedListNumber = await createNewListNumber()
//     await setDoc(doc(db, 'global_premade_lists', adjustedListNumber), list)
//     isLoading.value = false
//   } catch (err) {
//     console.log(err)
//   }
// }

// const createNewListNumber = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'global_premade_lists'))
//     const adjustedListNumber = querySnapshot.docs.length + 1
//     return addLeadingZeros(adjustedListNumber, 3)
//   } catch (err) {
//     throw err
//   }
// }

onMounted(() => {
  // console.log(user.value)
  // TODO instead of checking email, check for admin property or something in the final version. Or put this email in .env
  if (!authStore.signedInAsAdmin) router.push('/not-found')
})
</script>

<style lang="scss" scoped>
ion-content {
  @media only screen and (min-width: 481px) {
    --padding-start: 3rem;
    --padding-end: 3rem;
  }

  @media only screen and (min-width: 768px) {
    --padding-start: 8rem;
    --padding-end: 1rem;
  }
}

main {
  max-width: 600px;
  margin-top: 2rem;
  margin-left: auto;
  margin-right: auto;
}

label {
  margin-bottom: 0.5rem;
}
.upload {
  display: flex;
  flex-direction: column;

  &__buttons {
    display: flex;
    column-gap: 1rem;
  }
}
.submit-form {
  display: flex;
  margin-top: 1.5rem;
  width: 100%;

  .input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .input-field {
    display: flex;
    position: relative;

    input {
      width: 100%;
      height: 43px;
    }

    ion-button {
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }
}

body.dark input {
  color: black;
}
</style>
