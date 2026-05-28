<template>
  <v-card class="pa-4" outlined>
    <v-card-title>Create Account</v-card-title>
    <v-card-text>
      <v-text-field v-model="email" label="Email" type="email" />
      <v-text-field v-model="password" label="Password" type="password" />
      <v-text-field v-model="passwordConfirm" label="Confirm Password" type="password" />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" block @click="signUp">Create Account</v-btn>
    </v-card-actions>
    <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>
    
    <v-divider class="my-4" />
    
    <div class="text-center text-body-2">
      <span class="text-medium-emphasis">Already have an account?</span>
      <v-btn variant="text" color="primary" size="small" @click="$emit('switch','signin')">
        Sign in
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user'

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref<string | null>(null)
const userStore = useUserStore()

async function signUp() {
  error.value = null
  if (password.value !== passwordConfirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  try {
    const res = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (res.error) {
      error.value = res.error.message
    } else {
      // user will receive confirmation email if enabled; fetch session/update store
      await userStore.fetchSession()
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  }
}

// TODO: Add client-side password strength meter and terms checkbox
</script>

<style scoped>
</style>
