import api from './api';

export const servicioService = {
  listar: () => api.get('/servicios').then((r) => r.data.data),
  obtener: (id) => api.get(`/servicios/${id}`).then((r) => r.data.data),
  crear: (data) => api.post('/servicios', data).then((r) => r.data.data),
  actualizar: (id, data) => api.put(`/servicios/${id}`, data).then((r) => r.data.data),
  desactivar: (id) => api.delete(`/servicios/${id}`).then((r) => r.data),
};
