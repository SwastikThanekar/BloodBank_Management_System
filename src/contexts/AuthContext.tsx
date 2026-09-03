"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { storage } from '@/lib/storage'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string | null
  hospitalId?: number | null
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const token = storage.getToken()
    const savedUser = storage.getUser()
    
    if (token && savedUser) {
      setIsAuthenticated(true)
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      setIsAuthenticated(true)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    storage.clearAuth()
    setIsAuthenticated(false)
    setUser(null)
    router.push('/login')
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
