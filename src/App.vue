<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from './stores/cart.ts'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const cartOpen = ref(false)
const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
}

function remove(productId: string) {
  cart.removeItem(productId)
}

const router = useRouter();

function goToHomePage() {
  router.push({ name: 'Home' });
}
</script>

<template>
  <v-app :class="{ 'theme--dark': isDark }">
    <v-app-bar elevated>
      <v-btn icon @click="goToHomePage" aria-label="Go to home page">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-toolbar-title>My Shop — Guitar & Woodwork</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="toggleTheme" aria-label="Toggle theme">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      <v-btn icon @click="cartOpen = !cartOpen" aria-label="Open cart">
        <v-icon>mdi-cart</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="mt-6">
        <router-view />
      </v-container>
    </v-main>

    <v-navigation-drawer v-model="cartOpen" right temporary width="360">
      <v-sheet class="pa-4">
        <h3>Cart</h3>
        <v-divider class="my-2" />
        <div v-if="cart.items.length === 0">Your cart is empty</div>
        <v-list v-else>
          <v-list-item v-for="item in cart.items" :key="item.productId">
            <v-list-item-avatar>
              <v-img :src="item.image" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.quantity }} × ${{ (item.price_cents/100).toFixed(2) }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="remove(item.productId)"><v-icon>mdi-delete</v-icon></v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <v-divider class="my-2" />
        <div class="d-flex justify-space-between">
          <div>Subtotal</div>
          <div class="font-weight-medium">${{ (cart.subtotalCents/100).toFixed(2) }}</div>
        </div>
        <v-btn color="primary" class="mt-4" block>Checkout</v-btn>
      </v-sheet>
    </v-navigation-drawer>
  </v-app>
</template>

<style scoped>
.mt-6 { margin-top: 1.5rem; }
</style>
