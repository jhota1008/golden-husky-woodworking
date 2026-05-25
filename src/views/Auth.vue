<template>
  <v-container max-width="480" class="py-12">
    <AuthSignIn v-if="mode === 'signin'" @switch="mode = $event" />
    <AuthSignUp v-else @switch="mode = $event" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthSignIn from '../components/AuthSignIn.vue'
import AuthSignUp from '../components/AuthSignUp.vue'

// Allow the route to land directly on signup via /auth?mode=signup
const route = useRoute()
const mode = ref<'signin' | 'signup'>(
  route.query.mode === 'signup' ? 'signup' : 'signin'
)
</script>
