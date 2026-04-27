import { create } from 'zustand'
import type { User } from '../types/user'

interface AuthState {
  user: User | null
  token: string | null
  isHydrated: boolean
  initialize: () => Promise<void>
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isHydrated: false,

  initialize: async () => {
    if (get().isHydrated) return

    const token = localStorage.getItem('token')
    const rawUser = localStorage.getItem('user')
    let cachedUser: User | null = null

    if (rawUser) {
      try {
        cachedUser = JSON.parse(rawUser) as User
      } catch {
        localStorage.removeItem('user')
      }
    }

    if (!token) {
      set({ user: null, token: null, isHydrated: true })
      return
    }

    if (cachedUser) {
      set({ user: cachedUser, token, isHydrated: true })
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error('Unauthorized')
      }

      const data = await res.json() as { user: User }
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token, isHydrated: true })
    } catch {
      if (cachedUser) {
        return
      }

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isHydrated: true })
    }
  },

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isHydrated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isHydrated: true })
  },
}))
