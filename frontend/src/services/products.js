import { api } from './api.js'

export const productsApi = {
  async list(params = {}) {
    const data = await api.get('/api/products', { params })
    return data
  },
  async get(id) {
    const data = await api.get(`/api/products/${id}`)
    return data
  },
  async create(payload) {
    const data = await api.post('/api/products', payload)
    return data
  },
  async update(id, payload) {
    const data = await api.patch(`/api/products/${id}`, payload)
    return data
  },
  async remove(id) {
    const data = await api.delete(`/api/products/${id}`)
    return data
  },
}
