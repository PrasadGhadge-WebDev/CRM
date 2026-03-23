import { api } from './api'

export const authApi = {
  me: async () => {
    const response = await api.get('/api/auth/me')
    return response.user
  },
  updateProfile: async (payload) => {
    const response = await api.put('/api/auth/me', payload)
    return response
  },
  updatePassword: async (payload) => {
    const response = await api.put('/api/auth/password', payload)
    return response
  },
  updateSettings: async (payload) => {
    const response = await api.put('/api/auth/settings', payload)
    return response
  },
}
