import { useState } from 'react';
import { useCrearProfesional, useActualizarProfesional } from '../../hooks/useProfesionales';

export default function ProfesionalForm({ profesional, onSuccess }) {
  const crear = useCrearProfesional();
  const actualizar = useActualizarProfesional();

  const [form, setForm] = useState({
    nombre: profesional?.nombre || '',
    especialidad: profesional?.especialidad || '',
    telefono: profesional?.telefono || '',
    avatar_url: profesional?.avatar_url || '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profesional) {
      await actualizar.mutateAsync({ id: profesional.id, data: form });
    } else {
      await crear.mutateAsync(form);
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
        <label>Especialidad</label>
        <input value={form.especialidad} onChange={set('especialidad')} />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input value={form.telefono} onChange={set('telefono')} />
      </div>
      <div className="form-group">
        <label>URL de avatar</label>
        <input value={form.avatar_url} onChange={set('avatar_url')} type="url" />
      </div>
      {error && <p className="form-error">{error.response?.data?.message || 'Error al guardar'}</p>}
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? 'Guardando...' : profesional ? 'Actualizar' : 'Crear profesional'}
      </button>
    </form>
  );
}
