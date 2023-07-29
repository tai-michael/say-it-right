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
import useSafariDetector from '@/composables/useSafariDetector'

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

const { isSafari } = useSafariDetector()

router.beforeEach((to, from, next) => {
  const title = to.meta.title || 'Custom Lists'
  document.title = title as string

  // NOTE preventing browser back for Safari causes buggy animation
  if (isSafari.value || window.innerWidth >= 481) {
    next()
  } else if (window.event && window.event.type === 'popstate') {
    // Prevents browser back button from functioning on non-Safari mobile, which is necessary as it can cause confusing navigation for mobile users
    next(false)
  } else next()
})

// NOTE disables back button for non-Safari browsers only
// router.beforeEach((to, from, next) => {
//   const title = to.meta.title || 'Custom Lists'
//   document.title = title as string

//   // NOTE preventing browser back for Safari causes buggy animation
//   if (isSafari.value || !window.event || window.event.type !== 'popstate') {
//     next()
//   }
//   // NOTE prevents browser back button from functioning
//   else next(false)
// })

// REVIEW below code is buggy if back button is pressed more than once while in custom or provided lists view
// router.beforeEach((to, from) => {
//   const title = to.meta.title || 'Custom Lists'
//   document.title = title as string

//   if (isSafari.value || !window.event || window.event.type !== 'popstate') {
//     console.log('Go next')
//     console.log(`FROM: ${from.name}`)
//     console.log(`TO: ${to.name}`)
//     console.log(router)
//     if (
//       (from.name === 'custom-lists' && to.name !== 'custom-list') ||
//       (from.name === 'provided-lists' && to.name !== 'provided-list')
//     ) {
//       // router.go(1)
//       // router.go(-1)

//       return true
//     } else return true
//     // return true
//   }

//   if (from.name === 'provided-list') {
//     console.log('A')
//     useProvidedListsStore().setActiveId(null)
//     // return '/provided-lists'
//     if (to.name !== 'provided-lists') return { name: 'provided-lists', replace: true }
//   } else if (from.name === 'custom-list') {
//     console.log('B')
//     useCustomListsStore().setActiveId(null)
//     if (to.name !== 'custom-lists') return { name: 'custom-lists', replace: true }
//   } else if (from.name === 'provided-lists' || from.name === 'custom-lists') {
//     console.log('C')
//     console.log(`FROM: ${from.name}`)
//     console.log(`TO: ${to.name}`)
//     console.log(router)
//     router.go(1)

//     return false
//   }
// })

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
