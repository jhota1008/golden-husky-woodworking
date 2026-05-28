<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const sections = [
  {
    title: 'Custom Guitars',
    description: 'Handcrafted guitars tailored to your unique sound and style. Each instrument is a masterpiece of craftsmanship and attention to detail.',
    icon: 'mdi-guitar-electric',
    route: 'CustomGuitars',
    color: '#307351',
    image: '/cnc_guitar.jpeg'
  },
  {
    title: 'Guitar Services',
    description: 'Professional setup, repair, and maintenance services to keep your guitar playing at its best. From simple adjustments to complete restorations.',
    icon: 'mdi-tools',
    route: 'GuitarServices',
    color: '#F3BA0A',
    image: '/Fretboard.jpeg'
  },
  {
    title: 'Woodworking',
    description: 'Custom furniture, cabinetry, and fine woodworking pieces. Quality craftsmanship meets functional design for your home or office.',
    icon: 'mdi-saw-blade',
    route: 'Woodworking',
    color: '#786452',
    image: '/DogBed3.jpeg'
  }
]

function navigateToSection(routeName: string) {
  router.push({ name: routeName })
}

function scrollToProducts() {
  const element = document.getElementById('products')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <v-container fluid class="hero-section pa-0">
      <v-row no-gutters>
        <v-col cols="12">
          <div class="hero-image-container">
            <v-img
              src="/GHW_example_001.jpg"
              :height="$vuetify.display.smAndDown ? '400' : '500'"
              cover
              class="hero-image"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              position="center center"
            >
              <div class="hero-content">
                <v-container>
                  <v-row align="center" justify="center">
                    <v-col cols="12" md="8" class="text-center px-4">
                      <h1 class="text-h3 text-sm-h2 text-md-h1 font-weight-bold mb-3 mb-md-4 text-white hero-title">
                        Golden Husky Woodworking
                      </h1>
                      <p class="text-h6 text-sm-h5 text-md-h4 mb-4 mb-md-6 text-white hero-subtitle">
                        Crafting Excellence in Wood & Music
                      </p>
                      <p class="text-body-2 text-sm-body-1 text-md-h6 mb-6 mb-md-8 text-white hero-description">
                        Where traditional craftsmanship meets modern design. 
                        Specializing in custom guitars, professional services, and fine woodworking.
                      </p>
                      <v-btn
                        :size="$vuetify.display.smAndDown ? 'large' : 'x-large'"
                        color="secondary"
                        elevation="8"
                        class="explore-btn"
                        @click="scrollToProducts"
                      >
                        Explore Our Work
                        <v-icon end>mdi-arrow-down</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </v-img>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Products Section -->
    <v-container id="products" class="products-section py-12">
      <v-row class="mb-8">
        <v-col cols="12" class="text-center">
          <h2 class="text-h3 font-weight-bold mb-4">Our Services</h2>
          <p class="text-h6 text-medium-emphasis">
            Discover what we can create for you
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="(section, index) in sections"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="product-card"
            elevation="4"
            hover
            @click="navigateToSection(section.route)"
          >
            <v-img
              :src="section.image"
              :height="$vuetify.display.xs ? '200' : '250'"
              cover
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)"
              position="center center"
            >
              <div class="card-icon-overlay">
                <v-icon
                  :color="section.color"
                  size="80"
                  class="icon-shadow"
                >
                  {{ section.icon }}
                </v-icon>
              </div>
            </v-img>
            
            <v-card-title class="text-h5 font-weight-bold">
              {{ section.title }}
            </v-card-title>
            
            <v-card-text class="text-body-1">
              {{ section.description }}
            </v-card-text>
            
            <v-card-actions>
              <v-btn
                :color="section.color"
                variant="text"
                block
                size="large"
                @click="navigateToSection(section.route)"
              >
                Learn More
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Call to Action Section -->
    <v-container fluid class="cta-section py-12 py-md-16">
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center px-4">
          <h2 class="text-h4 text-md-h3 font-weight-bold mb-4">Ready to Start Your Project?</h2>
          <p class="text-body-1 text-md-h6 mb-6 mb-md-8">
            Whether you're looking for a custom guitar, need repairs, or want unique woodworking pieces,
            we're here to bring your vision to life.
          </p>
          <v-btn
            size="x-large"
            variant="outlined"
            color="secondary"
            class="mb-4"
            @click="router.push({ name: 'Auth' })"
          >
            <v-icon start>mdi-account</v-icon>
            Get Started
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.home-page {
  margin: -24px;
  margin-top: -24px;
}

@media (max-width: 600px) {
  .home-page {
    margin: -16px;
    margin-top: -16px;
  }
}

.hero-section {
  position: relative;
}

.hero-image-container {
  position: relative;
}

.hero-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.hero-title {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  animation: fadeInUp 1s ease-out;
}

.hero-subtitle {
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  animation: fadeInUp 1.2s ease-out;
}

.logo-glow {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  animation: fadeInDown 1s ease-out;
}

.explore-btn {
  animation: fadeInUp 1.4s ease-out;
  transition: transform 0.2s ease-in-out;
}

.explore-btn:hover {
  transform: translateY(-2px);
}

.products-section {
  background: linear-gradient(to bottom, #f5f5f5 0%, #ffffff 100%);
}

.product-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border-radius: 12px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.card-icon-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.icon-shadow {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
}

.cta-section {
  background: linear-gradient(135deg, #307351 0%, #443730 100%);
  color: white;
}

.cta-section h2,
.cta-section p {
  color: white;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark theme support */
.v-theme--dark .products-section {
  background: linear-gradient(to bottom, #1e1e1e 0%, #121212 100%);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .product-card {
    margin-bottom: 1.5rem;
  }
  
  .card-icon-overlay v-icon {
    font-size: 60px !important;
  }
}

@media (max-width: 600px) {
  .hero-content {
    padding: 1rem 0;
  }
  
  .hero-description {
    display: none;
  }
  
  .card-icon-overlay {
    display: none;
  }
  
  .explore-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
