import { createRouter, createWebHistory } from 'vue-router'
import CustomListsView from '@/views/CustomListsView.vue'
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
      path: '/custom-lists/:id?',
      name: 'custom-lists',
      component: CustomListsView
    },
    {
      path: '/provided-lists/:id?',
      name: 'provided-lists',
      // NOTE Route level code-splitting; this generates a separate chunk for this route which is lazy-loaded when the route is visited
      component: () => import('@/views/ProvidedListsView.vue')
      // // NOTE This (and 'props' in ProvidedLists component) is necessary for converting the params id from a string to number
      // props: ({ params }) => ({ id: Number.parseInt(params.id) })
      // children: [{ path: '', name: 'provided-lists', component: ProvidedListsView }]

      // children: [
      //   {
      //     path: 'word-test',
      //     name: 'word-test',
      //     component: () => import('@/components/WordChallenge.vue')
      //   },
      //   {
      //     path: 'sentence-test',
      //     name: 'sentence-test',
      //     component: () => import('@/components/SentenceChallenge.vue')
      //   }
      // ]
    },
    // {
    //   path: '/provided-lists/word-test',
    //   name: 'word-test',
    //   component: () => import('@/components/WordChallenge.vue')
    // }
    {
      path: '/word-review',
      name: 'word-review',
      component: () => import('@/views/ReviewView.vue')
    },
    {
      path: '/overview',
      name: 'overview',
      component: () => import('@/views/OverviewView.vue')
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
