<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">Your Orders</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">View and track your order history</p>
      </v-col>

      <v-col cols="12" v-if="!user">
        <v-alert type="info" variant="tonal" prominent>
          <v-icon start>mdi-account-alert</v-icon>
          Please sign in to view your orders.
        </v-alert>
      </v-col>

      <v-col cols="12" v-if="user && loading">
        <v-skeleton-loader type="card, card, card" />
      </v-col>

      <v-col cols="12" v-if="user && !loading && orders.length === 0">
        <v-alert type="info" variant="tonal">
          <v-icon start>mdi-cart-off</v-icon>
          No orders found. Start shopping to see your orders here!
        </v-alert>
      </v-col>

      <v-col 
        cols="12" 
        md="6" 
        lg="4"
        v-for="order in orders" 
        :key="order.id"
        v-if="user && !loading"
      >
        <v-card elevation="2" hover class="order-card">
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline text-medium-emphasis">Order</div>
              <div class="text-h6">#{{ order.id.substring(0, 8).toUpperCase() }}</div>
            </div>
            <v-chip 
              :color="getStatusColor(order.status)" 
              size="small"
              variant="flat"
            >
              {{ order.status }}
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-list density="compact" class="bg-transparent">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-calendar</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ formatDateEST(order.created_at) }}
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success">mdi-currency-usd</v-icon>
                </template>
                <v-list-item-title class="text-h6 font-weight-bold">
                  {{ formatPrice(order.total_cents) }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn 
              color="primary" 
              variant="elevated"
              block
              @click="viewOrder(order.id)"
            >
              <v-icon start>mdi-receipt-text</v-icon>
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const user = userStore.user
const orders = ref<any[]>([])
const loading = ref(false)
const router = useRouter()

function formatPrice(cents: number) {
  return `$${(Number(cents) / 100).toFixed(2)}`
}

function formatDateEST(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
    case 'failed':
      return 'error'
    default:
      return 'info'
  }
}

async function loadOrders() {
  if (!userStore.user) return
  loading.value = true
  try {
    // TODO: rely on RLS so we don't need to explicitly filter by user_id here
    const { data } = await supabase.from('orders').select('*').eq('user_id', userStore.user.id).order('created_at', { ascending: false })
    orders.value = data ?? []
  } catch (e) {
    orders.value = []
  } finally {

    loading.value = false
  }
}

function viewOrder(id: string) {
  router.push({ name: 'OrderDetail', params: { id } })
}

onMounted(async () => {
  await userStore.fetchSession()
  await loadOrders()
})
</script>

<style scoped>
.order-card {
  height: 100%;
  transition: transform 0.2s ease-in-out;
}

.order-card:hover {
  transform: translateY(-4px);
}
</style>
