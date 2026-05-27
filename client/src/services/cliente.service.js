import api from './api';

export const clienteService = {
  listar: (search) => api.get('/clientes', { params: search ? { search } : {} }).then((r) => r.data.data),
  obtener: (id) => api.get(`/clientes/${id}`).then((r) => r.data.data),
  crear: (data) => api.post('/clientes', data).then((r) => r.data.data),
  actualizar: (id, data) => api.put(`/clientes/${id}`, data).then((r) => r.data.data),
  eliminar: (id) => api.delete(`/clientes/${id}`).then((r) => r.data),
};
