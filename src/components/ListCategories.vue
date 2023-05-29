<template>
  <ion-accordion-group :multiple="true" :value="['inProgress', 'new', 'completed']">
    <ion-accordion value="inProgress" v-if="store.inProgressLists.length">
      <ion-item slot="header" :color="headerColor">
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
      <ion-item slot="header" :color="headerColor">
        <ion-label v-if="anyListStarted">{{
          props.routeName === 'provided-lists' ? 'Not Started' : 'New'
        }}</ion-label>
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
      <ion-item slot="header" :color="headerColor">
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
import { computed, inject } from 'vue'
import ListLinks from '@/components/ListLinks.vue'
import { useCustomListsStore } from '@/stores'
import { useProvidedListsStore } from '@/stores/index.ts'
import { IonAccordionGroup, IonAccordion, IonItem, IonLabel } from '@ionic/vue'
const props = defineProps({
  routeName: { type: String, required: true }
})

const store = props.routeName === 'provided-lists' ? useProvidedListsStore() : useCustomListsStore()
const destinationRoute = props.routeName === 'provided-lists' ? 'provided-list' : 'custom-list'
const anyListStarted = computed(() => store.inProgressLists.length || store.completedLists.length)

const isDarkModeEnabled = inject('isDarkModeEnabled')
// @ts-ignore
const headerColor = computed(() => (isDarkModeEnabled.value ? 'dark' : 'light'))
</script>
<style lang="scss" scoped></style>
