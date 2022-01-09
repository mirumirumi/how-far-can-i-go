import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: '',
    component: () => import("../views/.vue"),
  },
  {
    path: '/',
    name: '',
    component: () => import("../views/.vue"),
  },
  {
    path: '/',
    name: '',
    component: () => import("../views/.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
