<template>
  <div v-if="noListStarted">
    <ListCards
      :lists="store.untouchedLists"
      :destination-route="destinationRoute"
      @listDeleted="$emit('listDeleted')"
    />
  </div>

  <ion-accordion-group v-else :multiple="true" :value="['inProgress', 'new', 'completed']">
    <ion-accordion value="inProgress" v-if="store.inProgressLists.length">
      <ion-item slot="header" lines="none">
        <ion-label>In Progress</ion-label>
      </ion-item>
      <div slot="content">
        <ListCards
          :lists="store.inProgressLists"
          :destination-route="destinationRoute"
          @listDeleted="$emit('listDeleted')"
        />
      </div>
    </ion-accordion>
    <ion-accordion value="new" v-if="store.untouchedLists.length">
      <ion-item slot="header" lines="none">
        <!-- <ion-label v-if="noListStarted">{{
          props.routeName === 'provided-lists' ? 'Not Started' : 'New'
        }}</ion-label> -->
        <ion-label>Not Started</ion-label>
      </ion-item>
      <div slot="content">
        <ListCards
          :lists="store.untouchedLists"
          :destination-route="destinationRoute"
          @listDeleted="$emit('listDeleted')"
        />
      </div>
    </ion-accordion>
    <ion-accordion value="completed" v-if="store.completedLists.length">
      <ion-item slot="header" lines="none">
        <ion-label>Completed</ion-label>
      </ion-item>
      <div slot="content">
        <ListCards
          :lists="store.completedLists"
          :destination-route="destinationRoute"
          @listDeleted="$emit('listDeleted')"
        />
      </div>
    </ion-accordion>
  </ion-accordion-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ListCards from '@/components/ListCards.vue'
import { useCustomListsStore, useProvidedListsStore } from '@/stores/index.ts'
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel } from '@ionic/vue'
const props = defineProps({
  routeName: { type: String, required: true }
})

const store = props.routeName === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()
const destinationRoute = props.routeName === 'provided-lists' ? 'provided-list' : 'custom-list'
const noListStarted = computed(() => !store.inProgressLists.length && !store.completedLists.length)

// const isDarkModeEnabled = inject('isDarkModeEnabled')
// // @ts-ignore
// const headerColor = computed(() => (isDarkModeEnabled.value ? 'dark' : 'light'))
</script>
<style lang="scss" scoped>
// ion-accordion.accordion-expanded ion-item[slot='header'] {
//   --background: red;
//   --color: red;
// }
ion-accordion-group {
  padding: 0 !important;
}

ion-accordion {
  margin-top: 0.5rem;
}

ion-accordion:first-child {
  margin-top: 0;
}

ion-accordion ion-item[slot='header'] {
  // margin-bottom: 0.5rem;
  // --border-color: white;
  // border-bottom: 1px;
  --border-color: #eef9f8;
  // NOTE note specifying the border-style part results in no border
  border-bottom: 4mm groove #b9e5e1;
  --background: #eef9f8;
}

.sticky-header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
