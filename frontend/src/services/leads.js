import { api } from './api.js'

export const leadsApi = {
  async list(params = {}) {
    const { data } = await api.get('/api/leads', { params })
    return data
  },
  async get(id) {
    const { data } = await api.get(`/api/leads/${id}`)
    return data
  },
  async create(payload) {
    const { data } = await api.post('/api/leads', payload)
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/leads/${id}`, payload)
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`/api/leads/${id}`)
    return data
  },
  async listNotes(leadId) {
    const { data } = await api.get(`/api/leads/${leadId}/notes`)
    return data
  },
  async addNote(leadId, payload) {
    const { data } = await api.post(`/api/leads/${leadId}/notes`, payload)
    return data
  },
  async removeNote(leadId, noteId) {
    const { data } = await api.delete(`/api/leads/${leadId}/notes/${noteId}`)
    return data
  },
}

