import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref<any | null>(null)
  const session = ref<any | null>(null)

  async function fetchSession() {
    try {
      const { data } = await supabase.auth.getSession()
      session.value = data.session ?? null
      user.value = data.session?.user ?? null
    } catch (e) {
      session.value = null
      user.value = null
    }
  }

  // Listen to auth state changes and keep store in sync
  supabase.auth.onAuthStateChange((event, s) => {
    session.value = s ?? null
    user.value = s?.user ?? null
  })

  async function signOut() {
    await supabase.auth.signOut()
    session.value = null
    user.value = null
  }

  return { user, session, fetchSession, signOut }
})

// TODO: Add methods: updateProfile, refreshTokenHandling, and server-side session fetch
