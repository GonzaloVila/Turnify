import api from './api';

export const profesionalService = {
  listar: () => api.get('/profesionales').then((r) => r.data.data),
  obtener: (id) => api.get(`/profesionales/${id}`).then((r) => r.data.data),
  crear: (data) => api.post('/profesionales', data).then((r) => r.data.data),
  actualizar: (id, data) => api.put(`/profesionales/${id}`, data).then((r) => r.data.data),
  desactivar: (id) => api.delete(`/profesionales/${id}`).then((r) => r.data),
};
