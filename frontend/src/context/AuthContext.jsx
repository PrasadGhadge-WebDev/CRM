import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
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

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { user, token } = response.data
      
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { username, email, password })
      const { user, token } = response.data
      
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
