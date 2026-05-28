<template>
  <v-card class="pa-4" outlined>
    <v-card-title>Sign In</v-card-title>
    <v-card-text>
      <v-text-field v-model="email" label="Email" type="email" />
      <v-text-field v-model="password" label="Password" type="password" />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="signIn">Sign In</v-btn>
      <v-spacer />
      <v-btn text @click="$emit('switch','signup')">Create account</v-btn>
    </v-card-actions>
    <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const userStore = useUserStore()

async function signIn() {
  error.value = null
  try {
    const res = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (res.error) {
      error.value = res.error.message
    } else {
      // update local store; the store also listens to auth changes
      await userStore.fetchSession()
      
      // Redirect after successful sign-in
      const redirectTo = route.query.redirect as string || '/'
      router.push(redirectTo)
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  }
}

// TODO: Add social sign-in (Google/GitHub) buttons and handling
</script>

<style scoped>
</style>
