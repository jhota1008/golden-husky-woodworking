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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { supabase } from '../lib/supabase'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const sessionLoaded = ref(false)

const orderId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : (id ?? '')
})

// Ensure session is loaded after returning from Stripe
// If URL contains session tokens, restore them first
onMounted(async () => {
  console.log('[OrderConfirmation] Restoring session...')
  
  // Check if we have session tokens in the URL (from Stripe redirect)
  const accessToken = route.query.access_token as string
  const refreshToken = route.query.refresh_token as string
  
  if (accessToken && refreshToken) {
    console.log('[OrderConfirmation] Found session tokens in URL, restoring...')
    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (error) {
        console.error('[OrderConfirmation] Failed to restore session:', error)
      } else {
        console.log('[OrderConfirmation] Session restored from URL tokens')
        // Clean up URL by removing tokens
        router.replace({ 
          name: 'OrderConfirmation', 
          params: { id: orderId.value } 
        })
      }
    } catch (e) {
      console.error('[OrderConfirmation] Exception restoring session:', e)
    }
  }
  
  // Always fetch session to update the store
  await userStore.fetchSession()
  console.log('[OrderConfirmation] Session restored:', userStore.user ? 'Logged in' : 'Not logged in')
  sessionLoaded.value = true
})
</script>

<style scoped>
</style>
