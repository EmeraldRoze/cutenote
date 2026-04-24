import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl: string | null
  subscriptionStatus: string
  notesAllowance: number
  notesUsed: number
  giftedCredits: number
  points: number
  currentStreak: number
  isAdmin?: boolean
  isPrivate?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cn_token')
    if (!token) { setLoading(false); return }

    api.get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => localStorage.removeItem('cn_token'))
      .finally(() => setLoading(false))
  }, [])

  function login(token: string, userData: User) {
    localStorage.setItem('cn_token', token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('cn_token')
    setUser(null)
  }

  function refreshUser() {
    api.get('/auth/me').then((res) => setUser(res.data.data)).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
