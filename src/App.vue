<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from './stores/cart.ts'
import { useUserStore } from './stores/user'
import { useRouter } from 'vue-router'
import CartDrawer from './components/CartDrawer.vue'

const cart = useCartStore()
const userStore = useUserStore()
const cartOpen = ref(false)
const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
}

const router = useRouter();

function goToHomePage() {
  router.push({ name: 'Home' });
}

async function handleSignOut() {
  await userStore.signOut()
  router.push({ name: 'Auth' })
}
</script>

<template>
  <v-app :class="{ 'theme--dark': isDark }">
    <v-app-bar elevated>
      <v-btn icon @click="goToHomePage" aria-label="Go to home page">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-toolbar-title>Guitar & Woodwork</v-toolbar-title>
      
      <!-- Navigation Links -->
      <!-- TODO: Style these nav buttons to look better -->
      <!-- IDEAS: 
        - Use v-btn with variant="text" for a cleaner look
        - Add active state styling (check $route.name)
        - Make them more prominent or add hover effects
        - Consider using v-tabs instead of buttons for better UX
      -->
      <v-btn variant="text" @click="router.push({ name: 'CustomGuitars' })">
        Custom Guitars
      </v-btn>
      <v-btn variant="text" @click="router.push({ name: 'GuitarServices' })">
        Services
      </v-btn>
      <v-btn variant="text" @click="router.push({ name: 'Woodworking' })">
        Woodworking
      </v-btn>
      
      <v-spacer />
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn icon v-bind="props" aria-label="User account">
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="router.push({ name: 'OrderHistory' })">
            <v-list-item-title>Order History</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="!userStore.user" @click="router.push({ name: 'Auth' })">
            <v-list-item-title>Sign In / Sign Up</v-list-item-title>
          </v-list-item>
          <v-list-item v-else @click="handleSignOut">
            <v-list-item-title>Sign Out ({{ userStore.user.email }})</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn icon @click="toggleTheme" aria-label="Toggle theme">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      <v-btn icon @click="cartOpen = !cartOpen" aria-label="Open cart">
        <v-badge :content="cart.itemCount" :model-value="cart.itemCount > 0" color="primary">
          <v-icon>mdi-cart</v-icon>
        </v-badge>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="mt-6">
        <router-view />
      </v-container>
    </v-main>

    <!-- Cart drawer (handles item list, quantity controls, and checkout navigation) -->
    <CartDrawer v-model="cartOpen" />
  </v-app>
</template>

<style scoped>
.mt-6 { margin-top: 1.5rem; }
</style>
