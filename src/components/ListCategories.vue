<template>
  <ion-accordion-group :multiple="true" :value="['inProgress', 'new', 'completed']">
    <ion-accordion value="inProgress" v-if="store.inProgressLists.length">
      <ion-item slot="header" lines="none">
        <ion-label>In Progress</ion-label>
      </ion-item>
      <div slot="content">
        <ListLinks
          :lists="store.inProgressLists"
          :destination-route="destinationRoute"
          @listDeleted="$emit('listDeleted')"
        />
      </div>
    </ion-accordion>
    <ion-accordion value="new" v-if="store.untouchedLists.length">
      <ion-item slot="header" lines="none">
        <!-- <ion-label v-if="anyListStarted">{{
          props.routeName === 'provided-lists' ? 'Not Started' : 'New'
        }}</ion-label> -->
        <ion-label v-if="anyListStarted">Not Started</ion-label>
      </ion-item>
      <div slot="content">
        <ListLinks
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
        <ListLinks
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
import ListLinks from '@/components/ListLinks.vue'
import { useCustomListsStore, useProvidedListsStore } from '@/stores/index.ts'
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel } from '@ionic/vue'
const props = defineProps({
  routeName: { type: String, required: true }
})

const store = props.routeName === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()
const destinationRoute = props.routeName === 'provided-lists' ? 'provided-list' : 'custom-list'
const anyListStarted = computed(() => store.inProgressLists.length || store.completedLists.length)

// const isDarkModeEnabled = inject('isDarkModeEnabled')
// // @ts-ignore
// const headerColor = computed(() => (isDarkModeEnabled.value ? 'dark' : 'light'))
</script>
<style lang="scss" scoped>
// ion-accordion.accordion-expanded ion-item[slot='header'] {
//   --background: red;
//   --color: red;
// }
ion-accordion ion-item[slot='header'] {
  // --border-color: white;
  // border-bottom: 1px;
  // NOTE note specifying the border-style part results in no border
  border-bottom: 4mm groove rgba(211, 220, 50, 0.6);
}

ion-accordion-group {
  padding: 0 !important;
}

.sticky-header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
