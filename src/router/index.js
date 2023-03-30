import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue')

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
    }
    // {
    //   path: '/about/word-test',
    //   name: 'word-test',
    //   component: () => import('@/components/WordTest.vue')
    // }
  ]
})

export default router
