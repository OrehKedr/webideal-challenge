import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/results',
    name: 'Results',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Results.vue')
  },
  {
    path: '/search&page',
    name: 'search&page',
    component: () => import(/* webpackChunkName: "about" */ '../views/Results.vue'),
    props: (route) => ({ repository: route.query.repository,  page: route.query.page})
  }
]

const router = new VueRouter({
  mode: 'history',
  // base: __dirname,
  base: process.env.BASE_URL,
  routes
})

export default router
