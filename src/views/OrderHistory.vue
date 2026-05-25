<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>Your Orders</h2>
        <v-alert v-if="!user" type="info">Please sign in to view your orders.</v-alert>
      </v-col>

      <v-col cols="12" v-if="user">
        <v-skeleton-loader v-if="loading" type="list-item@6" />
        <v-list v-else>
          <v-list-item v-for="order in orders" :key="order.id">
            <v-list-item-content>
              <v-list-item-title>Order #{{ order.id }} — {{ order.status }}</v-list-item-title>
              <v-list-item-subtitle>Total: {{ formatPrice(order.total_cents) }} — {{ new Date(order.created_at).toLocaleString() }}</v-list-item-subtitle>
              <!-- TODO: Expand to list order items and link to ProductDetail -->
            </v-list-item-content>
            <v-list-item-action>
              <v-btn text @click="viewOrder(order.id)">View</v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert v-if="!orders.length && !loading" type="info">No orders found.</v-alert>
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
</style>
