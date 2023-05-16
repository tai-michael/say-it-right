import { createRouter, createWebHistory } from 'vue-router'
import CustomListsView from '@/views/CustomListsView.vue'
import { useCustomListsStore, useProvidedListsStore } from '@/stores/index.ts'
// import ProvidedListsView from '@/views/ProvidedListsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'custom-lists' }
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      // NOTE match any path that does not match an existing route
      alias: '/:pathMatch(.*)*'
    },
    {
      path: '/custom-lists',
      name: 'custom-lists',
      component: CustomListsView,
      beforeEnter: (to, from, next) => {
        const customListsStore = useCustomListsStore()
        const id = customListsStore.activeId
        if (id) {
          next({ name: 'custom-list', params: { id } })
        } else {
          next()
        }
      }
    },
    {
      path: '/custom-lists/:id',
      name: 'custom-list',
      component: () => import('@/components/CustomList.vue')
    },
    {
      path: '/review',
      name: 'review',
      component: () => import('@/views/ReviewView.vue')
    },
    {
      path: '/provided-lists',
      name: 'provided-lists',
      component: () => import('@/views/ProvidedListsView.vue'),
      beforeEnter: (to, from, next) => {
        const providedListsStore = useProvidedListsStore()
        const id = providedListsStore.activeId
        if (id) {
          next({ name: 'provided-list', params: { id } })
        } else {
          next()
        }
      }
    },
    {
      path: '/provided-lists/:id',
      name: 'provided-list',
      component: () => import('@/components/ProvidedList.vue')
    },
    {
      path: '/hard-words',
      name: 'hard-words',
      component: () => import('@/views/HardWordsView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue')
    }
  ],
  // @ts-ignore
  includeQueryParams: true
})

export default router

// router.beforeEach((to, from, next) => {
//   console.log(`Navigating from ${from.fullPath} to ${to.fullPath}`)
//   next()
// })
