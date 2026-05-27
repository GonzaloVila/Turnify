import api from './api';

export const turnoService = {
  listar: (params) => api.get('/turnos', { params }).then((r) => r.data.data),
  obtener: (id) => api.get(`/turnos/${id}`).then((r) => r.data.data),
  crear: (data) => api.post('/turnos', data).then((r) => r.data.data),
  cambiarEstado: (id, estado) => api.put(`/turnos/${id}/estado`, { estado }).then((r) => r.data.data),
  eliminar: (id) => api.delete(`/turnos/${id}`).then((r) => r.data),
  disponibilidad: (params) => api.get('/turnos/disponibilidad', { params }).then((r) => r.data.data),
};
