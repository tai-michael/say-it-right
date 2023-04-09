import { createRouter, createWebHistory } from 'vue-router'
import PersonalView from '@/views/PersonalView.vue'
// import SuggestedView from '@/views/SuggestedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home'
      // component: PersonalView
    },
    {
      path: '/personal/:id?',
      name: 'personal',
      component: PersonalView
    },
    {
      path: '/suggested/:id?',
      name: 'suggested',
      // NOTE Route level code-splitting; this generates a separate chunk for this route which is lazy-loaded when the route is visited
      component: () => import('@/views/SuggestedView.vue')
      // // NOTE This (and 'props' in SuggestedView component) is necessary for converting the params id from a string to number
      // props: ({ params }) => ({ id: Number.parseInt(params.id) })
      // children: [{ path: '', name: 'suggested', component: SuggestedView }]

      // children: [
      //   {
      //     path: 'word-test',
      //     name: 'word-test',
      //     component: () => import('@/components/WordTest.vue')
      //   },
      //   {
      //     path: 'sentence-test',
      //     name: 'sentence-test',
      //     component: () => import('@/components/SentenceTest.vue')
      //   }
      // ]
    },
    // {
    //   path: '/suggested/word-test',
    //   name: 'word-test',
    //   component: () => import('@/components/WordTest.vue')
    // }
    {
      path: '/wordlists',
      name: 'wordlists',
      component: () => import('@/views/WordlistsView.vue')
    }
  ],
  includeQueryParams: true
})

export default router
