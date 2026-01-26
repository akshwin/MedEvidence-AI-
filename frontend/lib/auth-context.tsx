'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from './api'

export interface User {
  id: string
  email: string
  full_name: string | null
  is_verified: boolean
  is_active: boolean
  created_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<{ message: string; user_id: string; verification_url?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Verify token is still valid by fetching user info
      fetchUserInfo(storedToken).catch(() => {
        // Token invalid, clear storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        setToken(null)
        setUser(null)
      })
    }
    setLoading(false)
  }, [])

  const fetchUserInfo = async (authToken: string) => {
    try {
      const userData = await authApi.getCurrentUser(authToken)
      setUser(userData)
      localStorage.setItem('auth_user', JSON.stringify(userData))
    } catch (error) {
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      setToken(response.access_token)
      setUser(response.user)
      localStorage.setItem('auth_token', response.access_token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      const result = await authApi.register(email, password, fullName)
      // After registration, automatically log in
      // If login fails, still return success since user was created
      try {
        await login(email, password)
      } catch (loginError: any) {
        // Log the login error but don't fail registration
        console.warn('Auto-login after registration failed:', loginError)
        // User can log in manually later
      }
      return result
    } catch (error: any) {
      // Extract error message from response
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    router.push('/')
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

