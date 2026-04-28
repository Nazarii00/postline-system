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
const AUTH_EXPIRED_ERROR = 'AUTH_EXPIRED'

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

      if (res.status === 401 || res.status === 403) {
        throw new Error(AUTH_EXPIRED_ERROR)
      }

      if (!res.ok) {
        throw new Error('Profile unavailable')
      }

      const data = await res.json() as { user: User }
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token, isHydrated: true })
    } catch (error) {
      const isAuthExpired = error instanceof Error && error.message === AUTH_EXPIRED_ERROR

      if (cachedUser && !isAuthExpired) {
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
