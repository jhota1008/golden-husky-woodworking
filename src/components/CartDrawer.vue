<template>
  <!-- Trigger button — place this in your App.vue nav bar -->
  <!-- <v-btn icon @click="open = true"><v-icon>mdi-cart</v-icon><v-badge :content="cart.itemCount" /></v-btn> -->

  <v-navigation-drawer v-model="open" location="right" temporary width="380">
    <v-toolbar flat>
      <v-toolbar-title>Your Cart</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="open = false"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-divider />

    <!-- Empty state -->
    <div v-if="!cart.items.length" class="pa-6 text-center text-medium-emphasis">
      <v-icon size="48" class="mb-2">mdi-cart-outline</v-icon>
      <p>Your cart is empty.</p>
    </div>

    <!-- Item list -->
    <v-list v-else lines="two" class="pa-0">
      <v-list-item v-for="item in cart.items" :key="item.productId" class="py-3">
        <template #prepend>
          <v-img
            v-if="item.image"
            :src="item.image"
            width="56"
            height="56"
            cover
            class="rounded mr-3"
          />
          <v-icon v-else size="56" class="mr-3">mdi-image-outline</v-icon>
        </template>

        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <v-list-item-subtitle>{{ formatPrice(item.price_cents) }} each</v-list-item-subtitle>

        <!-- Quantity controls -->
        <template #append>
          <div class="d-flex align-center ga-1">
            <v-btn icon size="x-small" @click="decrement(item)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <span class="mx-1">{{ item.quantity }}</span>
            <v-btn icon size="x-small" @click="cart.updateQuantity(item.productId, item.quantity + 1)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn icon size="x-small" color="error" class="ml-2" @click="cart.removeItem(item.productId)">
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <!-- Footer: subtotal + checkout -->
    <template #append>
      <v-divider />
      <div class="pa-4">
        <div class="d-flex justify-space-between mb-3">
          <span class="text-subtitle-1 font-weight-medium">Subtotal</span>
          <span class="text-subtitle-1 font-weight-bold">{{ formatPrice(cart.subtotalCents) }}</span>
        </div>
        <v-btn
          block
          color="primary"
          size="large"
          :disabled="!cart.items.length"
          @click="goToCheckout"
        >
          Proceed to Checkout
        </v-btn>

        <!-- TODO: Add a promo code input field here -->
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'

// `open` is a v-model so the parent can control visibility
const open = defineModel<boolean>({ default: false })

const cart = useCartStore()
const router = useRouter()

function formatPrice(cents: number) {
  return `$${(Number(cents) / 100).toFixed(2)}`
}

function decrement(item: { productId: string; quantity: number }) {
  if (item.quantity <= 1) {
    cart.removeItem(item.productId)
  } else {
    cart.updateQuantity(item.productId, item.quantity - 1)
  }
}

function goToCheckout() {
  open.value = false
  router.push({ name: 'Checkout' })
}
</script>

<style scoped>
</style>
