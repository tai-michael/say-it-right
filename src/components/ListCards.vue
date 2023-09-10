<template>
  <main>
    <ion-card v-for="list of props.lists" :key="list.listNumber" class="flex">
      <RouterLink
        :to="{ name: props.destinationRoute, params: { id: list.listNumber } }"
        class="list-link"
      >
        <ion-card-content class="p-0">
          <ion-toolbar>
            <ion-title class="font-normal"
              >{{ $t('list_card.title') }} {{ list.listNumber }}</ion-title
            >
            <button
              v-if="props.destinationRoute === 'custom-list'"
              slot="end"
              class="narrowscreen menu-button text-xl"
              :class="{ 'dark-mode': isDarkModeEnabled }"
              @click.stop.prevent="openNarrowscreenPopover($event, list)"
            >
              <ion-icon :icon="ellipsisHorizontal"></ion-icon>
            </button>
            <button
              v-if="props.destinationRoute === 'custom-list'"
              slot="end"
              class="widescreen menu-button text-xl"
              :class="{
                'dark-mode': isDarkModeEnabled,
                'btn-active': customListsStore.selectedPopoverList === list
              }"
              @click.stop.prevent="toggleWidescreenPopover(list)"
            >
              <ion-icon :icon="ellipsisHorizontal"></ion-icon>
            </button>
          </ion-toolbar>
          <ul class="list">
            <li class="list__row" v-for="(entry, index) in list.words" :key="index">
              <!-- {{ entry.word }}: {{ entry.count }} -->
              <span>{{ index }}</span>
            </li>
          </ul>

          <!-- NOTE Widescreen popover -->
          <div
            v-if="customListsStore.selectedPopoverList === list"
            class="widescreen-popover flex items-center text-center justify-center cursor-pointer pb-4 pt-4 text-black"
            @click.prevent="deleteList"
          >
            <ion-icon :icon="trashOutline" class="text-xl mr-2"></ion-icon
            ><span class="mr-2 mt-0.5 text-sm flex">{{ $t('list_card.delete_list') }}</span>
          </div>
        </ion-card-content>
      </RouterLink>
    </ion-card>

    <!-- NOTE Narrowscreen popover -->
    <ion-popover
      @click="setAlertOpen(true)"
      :is-open="isPopoverOpen"
      :event="event"
      @didDismiss="isPopoverOpen = false"
      :dismiss-on-select="true"
    >
      <div class="flex items-center text-center justify-center cursor-pointer pb-4 pt-4">
        <ion-icon :icon="trashOutline" class="text-xl mr-2"></ion-icon
        ><span class="mr-2 font-sans">{{ $t('list_card.delete_list') }}</span>
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
      :header="$t('alert_for_delete.message')"
      :buttons="alertButtons"
      @didDismiss="setAlertOpen(false)"
    ></ion-alert>
  </main>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import { useI18n } from 'vue-i18n'
import { ellipsisHorizontal, trashOutline } from 'ionicons/icons'
import {
  IonCard,
  IonToolbar,
  IonCardContent,
  IonTitle,
  IonIcon,
  IonPopover,
  IonAlert
  // IonList,
  // IonItem,
} from '@ionic/vue'
import { db, user } from '@/firebaseInit'
import { doc, updateDoc, arrayRemove } from 'firebase/firestore'
import { useCustomListsStore, usePremadeListsStore } from '@/stores/index.ts'
import { useRoute } from 'vue-router'
// import { listOutline } from 'ionicons/icons'
// import ListChecked from '@/assets/icons/list-checked.vue'
// import ListRegular from '@/assets/icons/list-regular.vue'
const route = useRoute()
const props = defineProps({
  lists: { type: Array as PropType<List[]>, required: true },
  destinationRoute: { type: String, required: true }
})
const store =
  props.destinationRoute === 'premade-list' ? usePremadeListsStore() : useCustomListsStore()
const customListsStore = useCustomListsStore()

const { t } = useI18n()
const isDarkModeEnabled = inject('isDarkModeEnabled')

// NOTE using store for selected popover list, so that it's shared across different List Groups (which each have their own set of List Cards); prevents having multiple popovers open across different List Groups
const isPopoverOpen = ref(false)
const event = ref(null)
const openNarrowscreenPopover = (e, list: List) => {
  event.value = e
  customListsStore.setSelectedPopoverList(list)
  isPopoverOpen.value = true
}

const toggleWidescreenPopover = (list: List) => {
  if (customListsStore.selectedPopoverList === list) {
    customListsStore.setSelectedPopoverList(null)
  } else {
    customListsStore.setSelectedPopoverList(list)
  }
}

watch(
  () => route.name,
  () => {
    customListsStore.setSelectedPopoverList(null)
  }
)

// Code for alert
const isAlertOpen = ref(false)
const setAlertOpen = (state: boolean) => {
  isAlertOpen.value = state
}
const alertButtons = [
  {
    text: t('alert_for_delete.cancel_button')
  },
  {
    text: t('alert_for_delete.delete_button'),
    handler: () => deleteList()
  }
]

const emit = defineEmits(['listDeleted'])
const deleteList = async () => {
  try {
    if (!user.value) throw new Error('User not defined')

    // NOTE opting not to await updateDoc, as it essentially freezes the screen
    const usersDocRef = doc(db, 'users', user.value.uid)
    updateDoc(usersDocRef, {
      customLists: arrayRemove(customListsStore.selectedPopoverList)
    })

    store.deleteList(customListsStore.selectedPopoverList.listNumber)
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
  padding-bottom: 1.5rem;
  column-gap: 1rem;
  background: #eef9f8;

  @media all and (min-width: 648px) {
    // max-height: 600px;
    // overflow: auto;
    padding-top: 1rem;
    padding-bottom: 2.5rem;
    padding-left: 2rem;
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

ion-toolbar {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --background: #b9e5e1;
  // --background: #a4ded8;
  // --background: #8ed6ce;
  display: flex;
  height: 100%;

  button {
    display: flex;
    align-items: center;
    height: 100%;
    // padding: 0.5rem 0.75rem;
    padding: 0 0.75rem;
    background-color: transparent;
    transition: background-color 0.3s;

    // ion-icon {
    //   height: 24px;
    //   width: 24px;
    // }
  }

  button:hover,
  .btn-active {
    background-color: rgb(199, 243, 239);
  }

  button.dark-mode {
    color-scheme: dark;
  }

  button.dark-mode:hover,
  button.dark-mode:active {
    background-color: rgb(39, 39, 39);
  }
}

.list-link {
  color: inherit;
  text-decoration: none;
}
.list-link:hover {
  // background-color: transparent;
  color: rgb(8, 8, 8);
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

// li {
//   margin-bottom: 4px; /* Increase the gap between rows */
// }
// ion-alert.custom-alert {
//   --backdrop-opacity: 0.7;
// }

ion-popover {
  --width: 160px;
}

.widescreen-popover {
  position: absolute;
  z-index: 20; // z-index of ion-toolbar is 10
  top: 3.1rem;
  bottom: 0;
  right: 0;
  width: 150px;
  height: 50px;
  margin-right: 0.25rem;
  border-radius: 0.25rem;
  background-color: white;
  box-shadow: 0 2px 6px 0 rgb(0, 0, 0, 0.35);
}

/* Default Styles for all screen sizes */
.narrowscreen {
  display: flex;
}

.widescreen,
.widescreen-popover {
  display: none;
}

/* Non-mobile devices */
@media screen and (min-width: 481px) {
  .narrowscreen,
  ion-popover {
    display: none;
  }

  .widescreen {
    display: inline-block;
  }

  .widescreen-popover {
    display: flex;
  }
}

body.dark {
  main {
    background: rgb(32, 32, 32);
  }

  button:hover,
  .btn-active {
    background-color: rgb(43, 43, 43);
  }

  ion-popover {
    --background: rgb(32, 32, 32);
  }

  .widescreen-popover {
    background: rgb(42, 42, 42);
    color: white;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 3px 1px -2px,
      rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
      rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;

    &:hover {
      background: rgb(44, 44, 44);
    }
  }

  ion-toolbar {
    // --background: rgb(34, 34, 34);
    --background: rgb(38, 38, 38);
    --color: rgb(196, 196, 196);
  }

  ion-card {
    --background: rgb(48, 48, 48);
    --color: rgb(196, 196, 196);
  }

  .list-link:hover {
    // background-color: transparent;
    color: rgb(240, 240, 240);
  }
}
</style>
