import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref<any | null>(null)
  const session = ref<any | null>(null)

  async function fetchSession() {
    try {
      console.log('[UserStore] Fetching session...')
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('[UserStore] Session fetch error:', error)
      }
      session.value = data.session ?? null
      user.value = data.session?.user ?? null
      console.log('[UserStore] Session fetched:', user.value ? `User: ${user.value.email}` : 'No user')
      return user.value
    } catch (e) {
      console.error('[UserStore] Exception fetching session:', e)
      session.value = null
      user.value = null
      return null
    }
  }

  // Listen to auth state changes and keep store in sync
  supabase.auth.onAuthStateChange((_event, s) => {
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
