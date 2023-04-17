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
      path: '/overview',
      name: 'overview',
      component: () => import('@/views/OverviewView.vue')
    }
  ],
  includeQueryParams: true
})

export default router
