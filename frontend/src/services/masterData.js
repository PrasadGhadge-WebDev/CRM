import { api } from './api';

export const masterDataApi = {
  list: (type) => api.get(`/api/master-data/${type}`),
  create: (type, data) => api.post(`/api/master-data/${type}`, data),
  update: (type, id, data) => api.put(`/api/master-data/${type}/${id}`, data),
  remove: (type, id) => api.delete(`/api/master-data/${type}/${id}`),
};
