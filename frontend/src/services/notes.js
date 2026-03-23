import { api } from './api';

export const notesApi = {
  list: (params) => api.get('/api/notes', { params }),
  create: (data) => api.post('/api/notes', data),
  remove: (id) => api.delete(`/api/notes/${id}`),
};
