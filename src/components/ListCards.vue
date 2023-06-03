<template>
  <main>
    <ion-card v-for="list of props.lists" :key="list.listNumber">
      <RouterLink
        :to="{ name: props.destinationRoute, params: { id: list.listNumber } }"
        class="list-link"
      >
        <ion-card-content class="p-0">
          <ion-toolbar class="flex justify-center items-center">
            <ion-title class="font-thin">List {{ list.listNumber }}</ion-title>
            <ion-icon
              v-if="props.destinationRoute === 'custom-list'"
              :icon="ellipsisHorizontal"
              class="text-xl mr-2"
              slot="end"
              @click.prevent="openPopover($event, list)"
            ></ion-icon>
          </ion-toolbar>
          <ul class="list">
            <li class="list__row" v-for="(entry, index) in list.words" :key="index">
              <!-- {{ entry.word }}: {{ entry.count }} -->
              <span>{{ index }}</span>
            </li>
          </ul>
        </ion-card-content>
      </RouterLink>
    </ion-card>
    <ion-popover
      :is-open="isPopoverOpen"
      :event="event"
      @didDismiss="isPopoverOpen = false"
      :dismiss-on-select="true"
      @click="setAlertOpen(true)"
    >
      <div class="flex items-center text-center justify-center cursor-pointer pb-4 pt-4">
        <ion-icon :icon="trashOutline" class="text-xl mr-2"></ion-icon
        ><span class="mr-2">Delete list</span>
        <!-- <ion-list>
        <ion-item :button="true" :detail="false">
          <ion-icon :icon="trashOutline" class="text-xl mr-2"></ion-icon>Delete list</ion-item
        >
        <ion-item :button="true" :detail="false">Option 2</ion-item>
                  <ion-item :button="true" id="nested-trigger">More options...</ion-item>

                  <ion-popover :dismiss-on-select="true" side="end">
                    <ion-content>
                      <ion-list>
                        <ion-item :button="true" :detail="false">Nested option</ion-item>
                      </ion-list>
                    </ion-content>
                  </ion-popover>
        </ion-list> -->
      </div>
    </ion-popover>
    <ion-alert
      :is-open="isAlertOpen"
      class="custom-alert"
      header="Are you sure?"
      :buttons="alertButtons"
      @didDismiss="setAlertOpen(false)"
    ></ion-alert>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import { ellipsisHorizontal, trashOutline } from 'ionicons/icons'
import {
  IonCard,
  IonToolbar,
  IonCardContent,
  IonTitle,
  IonIcon,
  IonContent,
  IonPopover,
  IonAlert
  // IonList,
  // IonItem,
} from '@ionic/vue'
import { db, user } from '@/firebaseInit'
import { doc, updateDoc, arrayRemove } from 'firebase/firestore'
import { useCustomListsStore, useProvidedListsStore } from '@/stores/index.ts'
// import { listOutline } from 'ionicons/icons'
// import ListChecked from '@/assets/icons/list-checked.vue'
// import ListRegular from '@/assets/icons/list-regular.vue'

const props = defineProps({
  lists: { type: Array as PropType<List[]>, required: true },
  destinationRoute: { type: String, required: true }
})

const store =
  props.destinationRoute === 'provided-list' ? useProvidedListsStore() : useCustomListsStore()

// Code for popover
// @ts-ignore
const selectedList = ref<List>({})
const isPopoverOpen = ref(false)
const event = ref(null)
const openPopover = (e, list: List) => {
  event.value = e
  selectedList.value = list
  isPopoverOpen.value = true
}

// Code for alert
const isAlertOpen = ref(false)
const setAlertOpen = (state: boolean) => {
  isAlertOpen.value = state
}
const alertButtons = [
  {
    text: 'Cancel'
  },
  {
    text: 'Delete',
    handler: () => deleteList()
  }
]

const emit = defineEmits(['listDeleted'])
const deleteList = async () => {
  try {
    if (!user.value) throw new Error('User not defined')

    const usersDocRef = doc(db, 'users', user.value.uid)
    await updateDoc(usersDocRef, {
      customLists: arrayRemove(selectedList.value)
    })

    store.deleteList(selectedList.value.listNumber)
    console.log('list deleted')
    emit('listDeleted')
    // trigger the toast
  } catch (err) {
    console.log(`Failed to delete list ${err}`)
  }
}
</script>

<style lang="scss" scoped>
// main {
//   display: grid;
//   grid-template-columns: repeat(4, 1fr);
//   gap: 1.5rem 2rem; // row-gap, column-gap
//   // list-style: none;
//   margin: 0 0.5rem;
//   @media (min-width: 1024px) {
//     grid-template-columns: repeat(6, 1fr);
//   }
// }

main {
  display: flex;
  flex-wrap: wrap;
  // align-content: flex-start; /* Optional: aligns items to the top */
  justify-content: center;
  margin-top: 0.75rem;
  margin-bottom: 1.5rem;
  column-gap: 1rem;

  @media all and (min-width: 648px) {
    // max-height: 600px;
    // overflow: auto;
    margin-top: 1rem;
    margin-bottom: 2.5rem;
    margin-left: 2.5rem;
    row-gap: 0.5rem;
    justify-content: left;

    &::-webkit-scrollbar {
      width: 14px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--ion-color-light, #f4f5f8);
    }
  }
}

ion-card {
  // default: 24px 16px
  margin: 18px 12px;
}

.list-link {
  color: inherit;
  text-decoration: none;
}
.list-link:hover {
  // background-color: transparent;
  color: rgb(136, 136, 136);
}

.list {
  width: 280px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 4px 12px;
  padding-left: 0.5rem;
  padding-right: 1.7rem;
  padding-bottom: 0.2rem;
  // overflow might be unnecessary
  overflow: hidden;
  text-overflow: ellipsis;
}

.list__row {
  padding-bottom: 4px;
  margin-left: 2.2rem;
}

ul {
  // list-style: none;
  padding-inline-start: 0;
  font-size: 16px;
  padding-bottom: 2px;
}

li {
  // margin-bottom: 4px; /* Increase the gap between rows */
}
ion-alert.custom-alert {
  // --backdrop-opacity: 0.7;
}

ion-popover {
  --width: 160px;
}
</style>
