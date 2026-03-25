import { api } from './api.js'

export const trashApi = {
  async list(params = {}) {
    const data = await api.get('/api/trash', { params })
    return data
  },
  async restore(id) {
    const data = await api.post(`/api/trash/${id}/restore`)
    return data
  },
  async remove(id) {
    const data = await api.delete(`/api/trash/${id}`)
    return data
  },
}
