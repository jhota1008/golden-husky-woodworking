<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="router.push({ name: 'OrderHistory' })"
          class="mb-4"
        >
          Back to Orders
        </v-btn>
      </v-col>

      <v-col cols="12" v-if="loading">
        <v-skeleton-loader type="article, list-item@3" />
      </v-col>

      <v-col cols="12" v-else-if="order">
        <v-card elevation="2">
          <v-card-title class="text-h4 bg-primary">
            Order #{{ order.id }}
          </v-card-title>

          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Order Information</h3>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold">Status</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip :color="getStatusColor(order.status)" size="small">
                        {{ order.status }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold">Order Date</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDateEST(order.created_at) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold">Total</v-list-item-title>
                    <v-list-item-subtitle class="text-h6 text-primary">
                      {{ formatPrice(order.total_cents) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="order.stripe_payment_intent_id">
                    <v-list-item-title class="font-weight-bold">Payment ID</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">
                      {{ order.stripe_payment_intent_id }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-3">Customer Information</h3>
                <v-list density="compact">
                  <v-list-item v-if="order.customer_email">
                    <v-list-item-title class="font-weight-bold">Email</v-list-item-title>
                    <v-list-item-subtitle>{{ order.customer_email }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="order.customer_name">
                    <v-list-item-title class="font-weight-bold">Name</v-list-item-title>
                    <v-list-item-subtitle>{{ order.customer_name }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <h3 class="text-h6 mb-4">Order Items</h3>
            <v-table v-if="orderItems.length > 0">
              <thead>
                <tr>
                  <th class="text-left">Product</th>
                  <th class="text-center">Quantity</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orderItems" :key="item.id">
                  <td>
                    <div class="d-flex align-center">
                      <v-img
                        v-if="item.product?.image"
                        :src="item.product.image"
                        width="60"
                        height="60"
                        cover
                        class="mr-3 rounded"
                      />
                      <div>
                        <div class="font-weight-medium">{{ item.title || item.product?.title || 'Unknown Product' }}</div>
                        <div class="text-caption text-medium-emphasis" v-if="item.product?.slug">
                          <router-link :to="{ name: 'ProductDetail', params: { slug: item.product.slug } }">
                            View Product
                          </router-link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right">{{ formatPrice(item.price_cents) }}</td>
                  <td class="text-right font-weight-bold">
                    {{ formatPrice(item.price_cents * item.quantity) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-weight-bold text-h6">Total:</td>
                  <td class="text-right font-weight-bold text-h6 text-primary">
                    {{ formatPrice(order.total_cents) }}
                  </td>
                </tr>
              </tfoot>
            </v-table>
            <v-alert v-else type="info" variant="tonal">
              No items found for this order.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" v-else>
        <v-alert type="error">
          Order not found or you don't have permission to view it.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { supabase } from '../lib/supabase'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const order = ref<any>(null)
const orderItems = ref<any[]>([])
const loading = ref(false)

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

async function loadOrder() {
  const orderId = route.params.id
  if (!orderId || !userStore.user) {
    console.log('Missing orderId or user:', { orderId, hasUser: !!userStore.user })
    return
  }

  console.log('Loading order:', orderId, 'for user:', userStore.user.id)
  
  loading.value = true
  try {
    // Fetch the order - RLS will automatically filter by user_id
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('Order fetch error:', orderError)
      throw orderError
    }
    
    console.log('Order loaded:', orderData)
    order.value = orderData

    // Fetch order items with product details
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products!order_items_product_id_fkey (
          id,
          title,
          slug,
          images,
          price_cents
        )
      `)
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Order items fetch error:', itemsError)
      throw itemsError
    }
    
    console.log('Order items loaded:', itemsData)
    
    // Map the products key to match our template and extract first image
    orderItems.value = (itemsData ?? []).map(item => ({
      ...item,
      product: {
        ...item.products,
        image: item.products?.images?.[0] || null
      }
    }))

  } catch (e) {
    console.error('Error loading order:', e)
    order.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await userStore.fetchSession()
  await loadOrder()
})
</script>

<style scoped>
.v-card-title {
  color: white;
}
</style>
