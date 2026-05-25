<template>
  <v-container class="py-12 text-center" max-width="600">
    <v-icon size="72" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
    <h2 class="text-h5 mb-2">Order Placed!</h2>
    <p class="text-medium-emphasis mb-1">
      Thank you for your order. We'll be in touch soon.
    </p>
    <p class="text-caption mb-6">Order ID: <strong>{{ orderId }}</strong></p>

    <div class="d-flex justify-center ga-3">
      <v-btn color="primary" :to="{ name: 'OrderHistory' }">View My Orders</v-btn>
      <v-btn variant="outlined" :to="{ name: 'Home' }">Continue Shopping</v-btn>
    </div>

    <!-- TODO: Send a confirmation email via Supabase Edge Function triggered on order insert -->
    <!-- TODO: Show order items summary here (fetch from order_items by orderId) -->
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : (id ?? '')
})


</script>

<style scoped>
</style>
