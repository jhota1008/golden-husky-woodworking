<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  guitarIdea: '',
  budget: '',
  timeline: ''
})

const formValid = ref(false)
const submitSuccess = ref(false)
const submitError = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const nameRules = [
  (v: string) => !!v || 'Name is required',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const ideaRules = [
  (v: string) => !!v || 'Please tell us about your guitar idea',
  (v: string) => v.length >= 20 || 'Please provide more details (at least 20 characters)',
]

const myGuitars = [
  {
    title: 'Headless Six String',
    images: [
      '/HeadlessGuitarFront.jpeg',
      '/HeadlessGuitarBack.jpeg'
    ],
    description: 'A headless six string guitar with Seymour Duncan Nazgul/Sentient pickups, maple and walnut neck, and a Strandberg-esque body shape designed for comfort and playability.',
    features: ['Custom body shape', 'Hand-selected woods', 'Premium hardware', 'Precision fretwork']
  },
  {
    title: 'Seven String Body',
    images: [
      '/finished_black_limba_seven.jpeg'
    ],
    description: 'My first build using CNC, this seven string body featuring an all black limba body with a natural finish. The body shape is a modern take on the classic superstrat, with deep cutaways for easy access to the upper frets and a contoured back for comfort.',
    features: ['Custom design', 'Quality construction', 'Natural finish', 'Professional setup']
  }
]

async function submitContactForm() {
  if (!formValid.value || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = false
  submitSuccess.value = false
  errorMessage.value = ''

  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-contact-email', {
      body: {
        name: contactForm.value.name,
        email: contactForm.value.email,
        phone: contactForm.value.phone,
        guitarIdea: contactForm.value.guitarIdea,
        budget: contactForm.value.budget,
        timeline: contactForm.value.timeline
      }
    })

    if (error) {
      throw error
    }

    // Success!
    submitSuccess.value = true
    
    // Reset form after a delay
    setTimeout(() => {
      contactForm.value = {
        name: '',
        email: '',
        phone: '',
        guitarIdea: '',
        budget: '',
        timeline: ''
      }
      submitSuccess.value = false
    }, 5000)

  } catch (error: any) {
    console.error('Error sending contact form:', error)
    submitError.value = true
    errorMessage.value = error.message || 'Failed to send message. Please try again or email directly.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="custom-guitars-page">
    <!-- Header Section -->
    <v-container>
      <v-row class="mb-8">
        <v-col cols="12" class="text-center px-4">
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">Custom Guitars</h1>
          <p class="text-h6 text-md-h5 text-medium-emphasis mb-4">
            One-of-a-Kind Instruments Built Just For You
          </p>
          <p class="text-body-1 mx-auto" style="max-width: 800px;">
            Every guitar I build is a unique collaboration between maker and musician. 
            I work closely with each client to understand their vision, playing style, and tonal preferences, 
            then craft an instrument that exceeds expectations.
          </p>
        </v-col>
      </v-row>

      <!-- My Work Section -->
      <v-row class="mb-12">
        <v-col cols="12">
          <h2 class="text-h3 font-weight-bold mb-6 text-center">
            <v-icon color="primary" size="large" class="mr-2">mdi-guitar-electric</v-icon>
            My Work
          </h2>
        </v-col>
        
        <v-col
          v-for="(guitar, index) in myGuitars"
          :key="index"
          cols="12"
          md="6"
        >
          <v-card elevation="4" class="guitar-showcase-card">
            <v-carousel
              :height="$vuetify.display.smAndDown ? '300' : '400'"
              hide-delimiters
              :show-arrows="$vuetify.display.smAndDown ? true : 'hover'"
              class="guitar-carousel"
            >
              <v-carousel-item
                v-for="(image, imgIndex) in guitar.images"
                :key="imgIndex"
              >
                <v-img
                  :src="image"
                  height="100%"
                  contain
                  class="guitar-carousel-image"
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="primary"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-carousel-item>
            </v-carousel>
            
            <v-card-title class="text-h5 font-weight-bold">
              {{ guitar.title }}
            </v-card-title>
            
            <v-card-text>
              <p class="text-body-1 mb-4">{{ guitar.description }}</p>
              
              <v-chip
                v-for="(feature, fIndex) in guitar.features"
                :key="fIndex"
                class="mr-2 mb-2"
                color="primary"
                variant="outlined"
                size="small"
              >
                {{ feature }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Process Section -->
      <v-row class="mb-12">
        <v-col cols="12">
          <v-card color="primary" variant="tonal" class="pa-4 pa-md-6">
            <h2 class="text-h5 text-md-h4 font-weight-bold mb-4 mb-md-6 text-center">How It Works</h2>
            <v-row>
              <v-col cols="12" sm="6" md="3" class="text-center">
                <v-icon :size="$vuetify.display.smAndDown ? '50' : '60'" color="primary" class="mb-3">mdi-email-outline</v-icon>
                <h3 class="text-h6 font-weight-bold mb-2">1. Get in Touch</h3>
                <p class="text-body-2">Share your vision and ideas using the form below</p>
              </v-col>
              <v-col cols="12" sm="6" md="3" class="text-center">
                <v-icon :size="$vuetify.display.smAndDown ? '50' : '60'" color="primary" class="mb-3">mdi-chat-processing-outline</v-icon>
                <h3 class="text-h6 font-weight-bold mb-2">2. Consultation</h3>
                <p class="text-body-2">We'll discuss details, options, pricing, and timeline</p>
              </v-col>
              <v-col cols="12" sm="6" md="3" class="text-center">
                <v-icon :size="$vuetify.display.smAndDown ? '50' : '60'" color="primary" class="mb-3">mdi-hammer-wrench</v-icon>
                <h3 class="text-h6 font-weight-bold mb-2">3. Crafting</h3>
                <p class="text-body-2">I'll build your guitar with regular progress updates</p>
              </v-col>
              <v-col cols="12" sm="6" md="3" class="text-center">
                <v-icon :size="$vuetify.display.smAndDown ? '50' : '60'" color="primary" class="mb-3">mdi-music</v-icon>
                <h3 class="text-h6 font-weight-bold mb-2">4. Delivery</h3>
                <p class="text-body-2">Receive your custom instrument, ready to play</p>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Contact Form Section -->
      <v-row id="contact-form">
        <v-col cols="12" md="8" offset-md="2">
          <v-card elevation="6" class="pa-4 pa-md-6">
            <v-card-title class="text-h5 text-md-h4 font-weight-bold text-center mb-2">
              Start Your Custom Guitar Journey
            </v-card-title>
            <v-card-subtitle class="text-center mb-6">
              Tell me about your dream guitar and let's start the conversation
            </v-card-subtitle>

            <v-form v-model="formValid" @submit.prevent="submitContactForm">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="contactForm.name"
                    label="Your Name *"
                    :rules="nameRules"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    required
                  />
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="contactForm.email"
                    label="Email Address *"
                    :rules="emailRules"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    type="email"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="contactForm.phone"
                    label="Phone Number (optional)"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    type="tel"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="contactForm.guitarIdea"
                    label="Tell me about your guitar idea *"
                    :rules="ideaRules"
                    variant="outlined"
                    prepend-inner-icon="mdi-guitar-electric"
                    rows="6"
                    hint="What style of guitar? What tone are you after? Any specific features or woods you're interested in?"
                    persistent-hint
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="contactForm.budget"
                    label="Budget Range (optional)"
                    variant="outlined"
                    prepend-inner-icon="mdi-currency-usd"
                    placeholder="e.g., $2000-3000"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="contactForm.timeline"
                    label="Desired Timeline (optional)"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar-clock"
                    placeholder="e.g., 3-4 months, flexible"
                  />
                </v-col>

                <v-col cols="12">
                  <v-alert
                    v-if="submitSuccess"
                    type="success"
                    variant="tonal"
                    class="mb-4"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    Thank you! Your message has been sent successfully. I'll get back to you within 24-48 hours.
                  </v-alert>

                  <v-alert
                    v-if="submitError"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                  >
                    <v-icon start>mdi-alert-circle</v-icon>
                    {{ errorMessage }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    color="primary"
                    size="x-large"
                    block
                    :disabled="!formValid || isSubmitting"
                    :loading="isSubmitting"
                  >
                    <v-icon start>mdi-send</v-icon>
                    {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                  </v-btn>
                  
                  <p class="text-caption text-center mt-4 text-medium-emphasis">
                    * Required fields. I typically respond within 24-48 hours.
                  </p>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-col>
      </v-row>

      <!-- Additional Info -->
      <v-row class="mt-12 mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-card variant="outlined" class="pa-4 text-center h-100">
            <v-icon size="50" color="primary" class="mb-3">mdi-tree</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Quality Materials</h3>
            <p class="text-body-2">
              I source premium tonewoods and hardware to ensure your guitar sounds as good as it looks
            </p>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-card variant="outlined" class="pa-4 text-center h-100">
            <v-icon size="50" color="primary" class="mb-3">mdi-account-heart</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Personal Service</h3>
            <p class="text-body-2">
              Working solo means you get my full attention and a truly personalized experience
            </p>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-card variant="outlined" class="pa-4 text-center h-100">
            <v-icon size="50" color="primary" class="mb-3">mdi-star-check</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Craftsmanship</h3>
            <p class="text-body-2">
              Every guitar is built with precision and passion using both CNC and hand tools to achieve the best results
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.custom-guitars-page {
  padding-bottom: 2rem;
}

.guitar-carousel {
  border-bottom: 3px solid #1976d2;
  background: linear-gradient(to bottom, #f5f5f5 0%, #e0e0e0 100%);
}

.guitar-carousel-image {
  background: linear-gradient(to bottom, #f5f5f5 0%, #e0e0e0 100%);
}

.guitar-carousel :deep(.v-carousel__controls) {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.guitar-showcase-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.guitar-showcase-card:hover {
  transform: translateY(-4px);
}

.guitar-image {
  border-bottom: 3px solid #1976d2;
}

.h-100 {
  height: 100%;
}
</style>
