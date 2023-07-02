import { createRouter, createWebHistory } from '@ionic/vue-router'
// import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import CustomListsView from '@/views/CustomListsView.vue'
// import CustomList from '@/components/CustomList.vue'
import ProvidedListsView from '@/views/ProvidedListsView.vue'
// import ProvidedList from '@/components/ProvidedList.vue'
import ReviewView from '@/views/ReviewView.vue'
import HardWordsView from '@/views/HardWordsView.vue'
// import { useCustomListsStore, useProvidedListsStore } from '@/stores/index.ts'
import TabsRoot from '@/components/TabsRoot.vue'
import { user } from '@/firebaseInit'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/custom-lists'
  },
  {
    path: '/',
    component: TabsRoot,
    children: [
      {
        path: 'custom-lists',
        name: 'custom-lists',
        // component: () => import('@/views/CustomListsView.vue'),
        component: CustomListsView,
        meta: {
          title: 'Custom Lists'
        }
        // NOTE made redundant by computed routes in TabRoutes component
        // beforeEnter: (to, from, next) => {
        //   const customListsStore = useCustomListsStore()
        //   const id = customListsStore.activeId
        //   if (id) {
        //     next({ name: 'custom-list', params: { id } })
        //   } else {
        //     next()
        //   }
        // }
      },
      {
        path: 'custom-lists/:id',
        name: 'custom-list',
        component: () => import('@/components/CustomList.vue'),
        // component: CustomList,
        meta: {
          title: 'Custom List'
        }
      },
      {
        path: 'review',
        name: 'review',
        // component: () => import('@/views/ReviewView.vue'),
        component: ReviewView,
        meta: {
          title: 'Review'
        }
      },
      {
        path: 'provided-lists',
        name: 'provided-lists',
        // component: () => import('@/views/ProvidedListsView.vue'),
        component: ProvidedListsView,
        meta: {
          title: 'Provided Lists'
        }
        // NOTE made redundant by computed routes in TabRoutes component
        // beforeEnter: (to, from, next) => {
        //   const providedListsStore = useProvidedListsStore()
        //   const id = providedListsStore.activeId
        //   if (id) {
        //     next({ name: 'provided-list', params: { id } })
        //   } else {
        //     next()
        //   }
        // }
      },
      {
        path: 'provided-lists/:id',
        name: 'provided-list',
        component: () => import('@/components/ProvidedList.vue'),
        // component: ProvidedList,
        meta: {
          title: 'Provided List'
        }
      },
      {
        path: 'hard-words',
        name: 'hard-words',
        // component: () => import('@/views/HardWordsView.vue'),
        component: HardWordsView,
        meta: {
          title: 'Hard Words'
        }
      },
      {
        path: '/sign-in',
        name: 'sign-in',
        // meta: { requiresAuth: true },
        component: () => import('@/views/SignInView.vue'),
        meta: {
          title: 'Sign In'
        },
        beforeEnter: (to, from, next) => {
          if (user.value) {
            next(from.path)
          } else {
            next()
          }
        }
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/AdminView.vue'),
        meta: {
          title: 'Admin'
        }
      }
    ]
  },
  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found'
    },
    // NOTE match any path that does not match an existing route
    alias: '/:pathMatch(.*)*'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // @ts-ignore
  includeQueryParams: true
})

const isSafari =
  navigator.vendor.match(/apple/i) &&
  !navigator.userAgent.match(/crios/i) &&
  !navigator.userAgent.match(/fxios/i) &&
  !navigator.userAgent.match(/Opera|OPT\//)

router.beforeEach((to, from, next) => {
  const title = to.meta.title || 'Custom Lists'
  document.title = title as string

  // NOTE trying to prevent browser back for Safari will cause buggy animation
  if (isSafari) next()
  // NOTE prevents browser back button from functioning
  else if (window.event && window.event.type == 'popstate') {
    next(false)
  } else {
    next()
  }
})

// let isReplacing = false

// router.beforeEach((to, from, next) => {
//   if (to.path !== from.path) {
//     if (isReplacing) {
//       isReplacing = false
//       next()
//     } else {
//       isReplacing = true
//       next(false) // REVIEW not sure if necessary
//       router.replace(to.path)
//     }
//   } else {
//     next()
//   }
// })

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'home',
//       redirect: { name: 'custom-lists' }
//     },
//     {
//       path: '/not-found',
//       name: 'not-found',
//       component: () => import('@/views/NotFoundView.vue'),
//       // NOTE match any path that does not match an existing route
//       alias: '/:pathMatch(.*)*'
//     },
//     {
//       path: '/custom-lists',
//       name: 'custom-lists',
//       component: CustomListsView,
//       beforeEnter: (to, from, next) => {
//         const customListsStore = useCustomListsStore()
//         const id = customListsStore.activeId
//         if (id) {
//           next({ name: 'custom-list', params: { id } })
//         } else {
//           next()
//         }
//       }
//     },
//     {
//       path: '/custom-lists/:id',
//       name: 'custom-list',
//       component: () => import('@/components/CustomList.vue')
//     },
//     {
//       path: '/review',
//       name: 'review',
//       component: () => import('@/views/ReviewView.vue')
//     },
//     {
//       path: '/provided-lists',
//       name: 'provided-lists',
//       component: () => import('@/views/ProvidedListsView.vue'),
//       beforeEnter: (to, from, next) => {
//         const providedListsStore = useProvidedListsStore()
//         const id = providedListsStore.activeId
//         if (id) {
//           next({ name: 'provided-list', params: { id } })
//         } else {
//           next()
//         }
//       }
//     },
//     {
//       path: '/provided-lists/:id',
//       name: 'provided-list',
//       component: () => import('@/components/ProvidedList.vue')
//     },
//     {
//       path: '/hard-words',
//       name: 'hard-words',
//       component: () => import('@/views/HardWordsView.vue')
//     },
//     {
//       path: '/admin',
//       name: 'admin',
//       component: () => import('@/views/AdminView.vue')
//     }
//   ],
//   // @ts-ignore
//   includeQueryParams: true
// })

export default router

// router.beforeEach((to, from, next) => {
//   console.log(`Navigating from ${from.fullPath} to ${to.fullPath}`)
//   next()
// })
