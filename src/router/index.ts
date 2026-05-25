import { createRouter, createWebHistory } from 'vue-router'

import ProductList from '../components/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import WoodworkingShop from '../views/WoodworkingShop.vue'
import GuitarServices from '../views/GuitarServices.vue'
import CustomGuitars from '../views/CustomGuitars.vue'
import Auth from '../views/Auth.vue'
import OrderHistory from '../views/OrderHistory.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import {useUserStore} from '../stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ProductList,
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

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  if (!userStore.user) await userStore.fetchSession()
  if (to.meta.requiresAuth && !userStore.user) return next({ name: 'Auth' })
  next()
})

export default router
