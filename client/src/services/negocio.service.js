import api from './api';

export const negocioService = {
  obtener: (id) => api.get(`/negocios/${id}`).then((r) => r.data.data),
  actualizar: (id, data) => api.put(`/negocios/${id}`, data).then((r) => r.data.data),
};
