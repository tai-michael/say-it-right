<template>
  <ion-page>
    <ion-content>
      <PullRefresher />
      <div class="upload" v-if="authStore.signedInAsAdmin">
        <label>Upload core lists to firestore:</label>
        <ion-button @click="uploadCoreLists(coreLists)" :disabled="isLoading">Upload</ion-button>
        <!-- <ion-button @click="uploadList(newList)">Upload new list</ion-button> -->
        <form class="submit-form" @submit.prevent="uploadList">
          <div class="input-container">
            <label>Upload new list to firestore:</label>
            <div class="input-field">
              <input
                placeholder="Enter list number (e.g. 13)"
                pattern="\d+"
                v-model="listNumOfListToAdd"
                autofocus
              />
              <ion-button type="submit" :disabled="isLoading">Upload</ion-button>
            </div>
          </div>
        </form>
      </div>

      <form class="submit-form" @submit.prevent="deleteList">
        <div class="input-container">
          <label>Delete list from firestore:</label>
          <div class="input-field">
            <input
              placeholder="Enter list number (e.g. 13)"
              pattern="\d+"
              v-model="listNumOfListToDel"
              autofocus
            />
            <ion-button type="submit" :disabled="isLoading">Delete</ion-button>
          </div>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PullRefresher from '@/components/PullRefresher.vue'
import coreLists from '@/assets/lists_1-12.json'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { db } from '@/firebaseInit'
import { deleteDoc, doc, collection, setDoc, writeBatch } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/index.ts'

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
      const listRef = doc(collection(db, 'global_provided_lists'), `${listNumberWithZeros}`)
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
    await setDoc(doc(db, 'global_provided_lists', adjustedListNumber), listData.default)
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
    await deleteDoc(doc(db, 'global_provided_lists', adjustedListNumber))
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

// const uploadList = async (list) => {
//   try {
//     isLoading.value = true
//     const adjustedListNumber = await createNewListNumber()
//     await setDoc(doc(db, 'global_provided_lists', adjustedListNumber), list)
//     isLoading.value = false
//   } catch (err) {
//     console.log(err)
//   }
// }

// const createNewListNumber = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, 'global_provided_lists'))
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

  .input-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .input-field {
    display: flex;

    input {
      width: 100%;
    }
  }
}
</style>
