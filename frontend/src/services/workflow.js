import { api } from './api.js'

export const ordersApi = {
  async list(params = {}) {
    const data = await api.get('/api/orders', { params })
    return data
  },
  async get(id) {
    const data = await api.get(`/api/orders/${id}`)
    return data
  },
  async update(id, payload) {
    const data = await api.patch(`/api/orders/${id}`, payload)
    return data
  },
}

export const supportApi = {
  async list(params = {}) {
    const data = await api.get('/api/support', { params })
    return data
  },
  async get(id) {
    const data = await api.get(`/api/support/${id}`)
    return data
  },
  async update(id, payload) {
    const data = await api.patch(`/api/support/${id}`, payload)
    return data
  },
}

export const workflowApi = {
  async convertToDeal(leadId, dealData) {
    const data = await api.post('/api/workflow/convert-to-deal', { leadId, dealData })
    return data
  },
  async convertToCustomer(sourceId, sourceType, customerData) {
    const data = await api.post('/api/workflow/convert-to-customer', { sourceId, sourceType, customerData })
    return data
  },
  async createOrder(orderData) {
    const data = await api.post('/api/workflow/create-order', orderData)
    return data
  },
  async createSupportTicket(ticketData) {
    const data = await api.post('/api/workflow/create-support-ticket', ticketData)
    return data
  },
  async assignLead(leadId, userId) {
    const data = await api.post('/api/workflow/assign-lead', { leadId, userId })
    return data
  },
  async updateLeadStatus(leadId, status) {
    const data = await api.patch('/api/workflow/update-lead-status', { leadId, status })
    return data
  },
}
