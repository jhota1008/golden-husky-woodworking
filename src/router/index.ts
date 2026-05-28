import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import WoodworkingShop from '../views/WoodworkingShop.vue'
import GuitarServices from '../views/GuitarServices.vue'
import CustomGuitars from '../views/CustomGuitars.vue'
import Auth from '../views/Auth.vue'
import OrderHistory from '../views/OrderHistory.vue'
import OrderDetail from '../views/OrderDetail.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import {useUserStore} from '../stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/shop/woodworking',
    name: 'Woodworking',
    component: WoodworkingShop,
  },
  {
    path: '/shop/guitar-services',
    name: 'GuitarServices',
    component: GuitarServices,
  },
  {
    path: '/shop/custom-guitars',
    name: 'CustomGuitars',
    component: CustomGuitars,
  },
  {
    path: '/product/:slug',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
  },
  {
    path: '/orderHistory',
    name: 'OrderHistory',
    meta: { requiresAuth: true },
    component: OrderHistory,
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    meta: { requiresAuth: true },
    component: OrderDetail,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    meta: { requiresAuth: true },
    component: Checkout,
  },
  {
    path: '/order-confirmation/:id',
    name: 'OrderConfirmation',
    meta: { requiresAuth: false },
    component: OrderConfirmation,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  console.log(`[Router] Navigating from ${from.path} to ${to.path}`)
  console.log(`[Router] Current user:`, userStore.user ? userStore.user.email : 'None')
  
  if (!userStore.user) {
    console.log('[Router] No user in store, fetching session...')
    await userStore.fetchSession()
  }
  
  if (to.meta.requiresAuth && !userStore.user) {
    console.log('[Router] Auth required but no user, redirecting to auth')
    return next({ name: 'Auth' })
  }
  
  console.log('[Router] Navigation allowed')
  next()
})

export default router
