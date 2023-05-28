<template>
  <main>
    <div v-for="list of props.lists" :key="list.listNumber" style="position: relative">
      <ion-card>
        <RouterLink
          :to="{ name: props.destinationRoute, params: { id: list.listNumber } }"
          class="list-link"
        >
          <ion-card-content class="p-0">
            <ion-toolbar class="flex justify-center items-center">
              <ion-title class="font-thin">List {{ list.listNumber }}</ion-title>
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
      <ion-icon
        v-if="props.destinationRoute === 'custom-list'"
        :icon="ellipsisHorizontal"
        class="text-xl mr-2"
        style="position: absolute; top: 26px; right: 8px; padding: 0.7rem"
        @click="testFn()"
      ></ion-icon>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { List } from '@/stores/modules/types/List'
import { ellipsisHorizontal } from 'ionicons/icons'
import { IonCard, IonToolbar, IonCardContent, IonTitle, IonIcon } from '@ionic/vue'
// import { listOutline } from 'ionicons/icons'
// import ListChecked from '@/assets/icons/list-checked.vue'
// import ListRegular from '@/assets/icons/list-regular.vue'

const props = defineProps({
  lists: { type: Array as PropType<List[]>, required: true },
  destinationRoute: { type: String, required: true }
})

const testFn = () => {
  console.log('clicked')
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
  // justify-content: center;
  margin-bottom: 1.5rem;
  column-gap: 1rem;

  @media all and (min-width: 648px) {
    // max-height: 600px;
    // overflow: auto;
    margin-left: 1rem;
    row-gap: 0.5rem;

    &::-webkit-scrollbar {
      width: 14px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--ion-color-light, #f4f5f8);
    }
  }
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
  grid-gap: 4px 16px;
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
</style>
