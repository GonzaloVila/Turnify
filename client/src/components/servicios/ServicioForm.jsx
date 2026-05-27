import { useState } from 'react';
import { useCrearServicio, useActualizarServicio } from '../../hooks/useServicios';

export default function ServicioForm({ servicio, onSuccess }) {
  const crear = useCrearServicio();
  const actualizar = useActualizarServicio();

  const [form, setForm] = useState({
    nombre: servicio?.nombre || '',
    descripcion: servicio?.descripcion || '',
    duracion_min: servicio?.duracion_min || 30,
    precio: servicio?.precio || '',
    color: servicio?.color || '#3b82f6',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, duracion_min: parseInt(form.duracion_min, 10), precio: form.precio || undefined };
    if (servicio) {
      await actualizar.mutateAsync({ id: servicio.id, data });
    } else {
      await crear.mutateAsync(data);
    }
    onSuccess?.();
  };

  const isPending = crear.isPending || actualizar.isPending;
  const error = crear.error || actualizar.error;

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Nombre *</label>
        <input value={form.nombre} onChange={set('nombre')} required />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea value={form.descripcion} onChange={set('descripcion')} rows={2} />
      </div>
      <div className="form-group">
        <label>Duración (minutos) *</label>
        <input type="number" min={5} step={5} value={form.duracion_min} onChange={set('duracion_min')} required />
      </div>
      <div className="form-group">
        <label>Precio</label>
        <input type="number" min={0} step={0.01} value={form.precio} onChange={set('precio')} />
      </div>
      <div className="form-group">
        <label>Color</label>
        <input type="color" value={form.color} onChange={set('color')} />
      </div>
      {error && <p className="form-error">{error.response?.data?.message || 'Error al guardar'}</p>}
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? 'Guardando...' : servicio ? 'Actualizar' : 'Crear servicio'}
      </button>
    </form>
  );
}
