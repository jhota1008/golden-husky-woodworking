<template>
  <v-container>
    <v-row>
      <!-- Back button -->
      <v-col cols="12" class="text-left">
         <v-btn @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
         </v-btn>
      </v-col>

      <!-- Image Gallery Column -->
      <v-col cols="12" md="6">
         <v-img :src="selectedImage?.url" aspect-ratio="1"></v-img>
         <v-row>
          <v-col v-for="(image, index) in product?.images || []" :key="index" cols="3" sm="3">
            <v-img 
              :src="image.url"
              @click="selectImage((Number(index)))"
              class="cursor-pointer thumbnail"
              :class="{'selected': selectedImageIndex === index}"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- Product Info Column -->
      <v-col cols="12" md="6">
         <h1>{{ product?.title }}</h1>
         <p>${{ (product?.price_cents / 100).toFixed(2) }}</p>
         <p>{{ product?.description }}</p>
        
        <!-- Product Options/Preferences Section -->
        <!-- TODO: Add a section for product customization options -->
        <!-- IDEAS: 
          - Color picker (v-color-picker)
          - Size dropdown (v-select)
          - Quantity stepper (v-text-field with type="number")
          - Custom text engraving input (v-text-field)
          - Finish options (v-radio-group or v-select)
        -->

        <!-- Quantity Selector -->
         <v-text-field
          v-model="quantity"
          type="number"
          label="Quantity"
          min="0"
        ></v-text-field>
        
         <v-btn @click="addToCart">
          Add to Cart
         </v-btn>
      </v-col>
    </v-row>

    <!-- Additional Details Section -->
    <v-row class="mt-8">
      <v-col cols="12">
        <!-- TODO: Add tabs for additional information -->
        <!-- IDEAS:
          - Description tab (full detailed description)
          - Specifications tab (dimensions, materials, etc.)
          - Shipping info tab
          - Reviews tab (future feature)
        -->
        <!-- HINT: Use v-tabs and v-tab-item -->
      </v-col>
    </v-row>

    <!-- Related Products Section (Advanced Challenge) -->
    <!-- TODO: Show related products from the same category -->
    <!-- HINT: Fetch products with matching categories from Supabase -->
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { supabase } from '../lib/supabase';


const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const productSlug = route.params.slug

 const product = ref<any>(null)
 const loading = ref(false)
 const error = ref<string | null>(null)
 const selectedImageIndex = ref(0)
 const quantity = ref(0)

 const selectedImage = computed(() => {
  if (!product.value?.images?.length) return null
  return product.value.images[selectedImageIndex.value] || product.value.images[0]
})

async function loadProduct() {
  // Fetch product by ID or slug
  // Handle loading and error states
  loading.value = true
  const { data, error: fetchError } = await supabase.from('products').select('*').eq('slug', productSlug).single()
  if (fetchError) {
    error.value = fetchError.message
  } else {
    product.value = data
  }
  loading.value = false
}

 function selectImage(index: number) { 
    selectedImageIndex.value = index
  }


function addToCart() {
  // Validate quantity and required options
  // Add to cart with selected preferences
  // Show success message (optional: use v-snackbar)
  if (quantity.value > 0) {
    cart.addItem(product.value, quantity.value)
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.thumbnail {
  opacity: 0.5;
  transition: opacity 0.3s;
}

.thumbnail:hover {
  opacity: 0.8;
}

.thumbnail.selected {
  opacity: 1;
  border: 2px solid #1976d2;
}
</style>
