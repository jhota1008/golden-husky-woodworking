<template>
  <v-container class="py-8" max-width="900">
    <v-row>
      <!-- Page title -->
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Checkout</h2>
        <v-alert v-if="!user" type="warning" dense>
          You are not signed in. <v-btn variant="text" :to="{ name: 'Auth' }">Sign in</v-btn> to save your order history.
        </v-alert>
      </v-col>

      <!-- Left: Shipping form -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="px-0">Shipping Information</v-card-title>
          <v-form ref="formRef" v-model="formValid">
            <v-text-field
              v-model="shipping.name"
              label="Full Name"
              :rules="[required]"
              class="mb-2"
            />
            <v-text-field
              v-model="shipping.email"
              label="Email"
              type="email"
              :rules="[required, validEmail]"
              class="mb-2"
            />
            <v-text-field
              v-model="shipping.address"
              label="Street Address"
              :rules="[required]"
              class="mb-2"
            />
            <v-row>
              <v-col cols="12" sm="5">
                <v-text-field v-model="shipping.city" label="City" :rules="[required]" />
              </v-col>
              <v-col cols="6" sm="3">
                <v-text-field v-model="shipping.state" label="State" :rules="[required]" />
              </v-col>
              <v-col cols="6" sm="4">
                <v-text-field v-model="shipping.zip" label="ZIP" :rules="[required]" />
              </v-col>
            </v-row>
            <v-text-field v-model="shipping.country" label="Country" :rules="[required]" />
          </v-form>

        </v-card>
      </v-col>

      <!-- Right: Order summary -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="px-0">Order Summary</v-card-title>
          <v-list density="compact" class="pa-0">
            <v-list-item v-for="item in cart.items" :key="item.productId">
              <v-list-item-title>{{ item.title }} × {{ item.quantity }}</v-list-item-title>
              <template #append>
                <span>{{ formatPrice(item.price_cents * item.quantity) }}</span>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-3" />

          <div class="d-flex justify-space-between text-subtitle-1 font-weight-bold">
            <span>Total</span>
            <span>{{ formatPrice(cart.subtotalCents) }}</span>
          </div>

          <v-alert v-if="orderError" type="error" dense class="mt-3">{{ orderError }}</v-alert>

          <v-btn
            block
            color="primary"
            size="large"
            class="mt-4"
            :loading="submitting"
            :disabled="!cart.items.length || submitting"
            @click="placeOrder"
          >
            Place Order
          </v-btn>

          <p class="text-caption text-center mt-2 text-medium-emphasis">
            Payments are processed securely via Stripe.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const cart = useCartStore()
const userStore = useUserStore()
const user = userStore.user
const router = useRouter()

// Redirect to sign-in if not authenticated
onMounted(async () => {
  await userStore.fetchSession()
  if (!userStore.user) router.replace({ name: 'Auth', query: { redirect: '/checkout' } })
})

const formRef = ref<any>(null)
const formValid = ref(false)
const submitting = ref(false)
const orderError = ref<string | null>(null)

const shipping = reactive({
  name: '',
  email: user?.email ?? '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
})

// Validation rules
const required = (v: string) => !!v?.trim() || 'Required'
const validEmail = (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email'

function formatPrice(cents: number) {
  return `$${(Number(cents) / 100).toFixed(2)}`
}

async function placeOrder() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  orderError.value = null

  try {
    // Get the current session access token to pass through Stripe redirect
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData?.session?.access_token
    const refreshToken = sessionData?.session?.refresh_token

    // Call the create-checkout-session Edge Function.
    // It creates a pending order in DB + a Stripe Checkout Session
    // and returns the session ID for client-side redirect.
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        items: cart.items,
        shipping: { ...shipping },
        userId: userStore.user!.id,
        totalCents: cart.subtotalCents,
        sessionTokens: accessToken && refreshToken ? { accessToken, refreshToken } : null,
      },
    })

    if (error) {
      // Log full error context so browser DevTools shows the root cause
      console.error('[checkout] edge function error:', error, (error as any).context)
      throw new Error(error.message)
    }

    // Clear cart before redirect
    cart.clear()

    // Redirect to Stripe Checkout
    // The session will be restored in OrderConfirmation via URL tokens
    window.location.href = data.url
  } catch (e: any) {
    orderError.value = e?.message ?? 'Something went wrong. Please try again.'
    submitting.value = false
  }
}
</script>

<style scoped>
</style>
