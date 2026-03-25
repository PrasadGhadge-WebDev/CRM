import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'
import { authApi } from '../services/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function storeSession(user, token) {
  localStorage.setItem('user', JSON.stringify(user))
  if (token) {
    localStorage.setItem('token', token)
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email: String(email ?? '').trim().toLowerCase(),
        password,
      })
      const { user: nextUser, token } = response

      storeSession(nextUser, token)
      setUser(nextUser)

      return { success: true }
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || error.message }
    }
  }, [])

  const register = useCallback(async (payload) => {
    try {
      const response = await api.post('/api/auth/register', {
        username: String(payload.username ?? '').trim(),
        name: String(payload.fullName ?? '').trim(),
        email: String(payload.email ?? '').trim().toLowerCase(),
        phone: String(payload.phone ?? '').trim(),
        password: payload.password,
        role: String(payload.role ?? '').trim(),
      })
      return {
        success: true,
        requiresApproval: Boolean(response?.requiresApproval),
        message: 'Registration submitted. Wait for admin approval before logging in.',
      }
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || error.message }
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const nextUser = await authApi.me()
    storeSession(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const updateUser = useCallback((nextUser) => {
    storeSession(nextUser)
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.get('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
