import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/Index/Index.vue'),
    redirect: {  name: 'board', },
    children: [
      {
        path: '/board',
        name: 'board',
        component: () => import('@/pages/Index/BoardPage.vue')
      },
      {
        path: '/add-card',
        name: 'add-card',
        component: () => import('@/pages/Index/AddCardPage.vue')
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
