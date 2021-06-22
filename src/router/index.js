import { createRouter, createWebHistory } from 'vue-router'
import Master from '@/views/Master.vue'

const routes = [
  {
    path: '/',
    name: 'Master',
    component: Master
  },
  {
    path: '/puppet',
    name: 'Puppet',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Puppet.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
