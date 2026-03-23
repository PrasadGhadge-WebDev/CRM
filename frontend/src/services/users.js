import { api } from './api.js'

export const usersApi = {
  async list(params = {}) {
    const data = await api.get('/api/users', { params })
    return data
  },
  async get(id) {
    const data = await api.get(`/api/users/${id}`)
    return data
  },
  async create(payload) {
    const data = await api.post('/api/users', payload)
    return data
  },
  async update(id, payload) {
    const data = await api.put(`/api/users/${id}`, payload)
    return data
  },
  async remove(id) {
    const data = await api.delete(`/api/users/${id}`)
    return data
  },
}
