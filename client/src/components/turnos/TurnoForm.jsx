import { useState } from 'react';
import { useProfesionales } from '../../hooks/useProfesionales';
import { useServicios } from '../../hooks/useServicios';
import { useClientes } from '../../hooks/useClientes';
import { useCrearTurno } from '../../hooks/useTurnos';

export default function TurnoForm({ onSuccess, fechaInicial }) {
  const { data: profesionales = [] } = useProfesionales();
  const { data: servicios = [] } = useServicios();
  const { data: clientes = [] } = useClientes();
  const crearTurno = useCrearTurno();

  const [form, setForm] = useState({
    profesional_id: '',
    servicio_id: '',
    cliente_id: '',
    fecha_hora_inicio: fechaInicial ? fechaInicial.toISOString().slice(0, 16) : '',
    notas: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearTurno.mutateAsync({
        ...form,
        fecha_hora_inicio: new Date(form.fecha_hora_inicio).toISOString(),
        cliente_id: form.cliente_id || undefined,
        notas: form.notas || undefined,
      });
      onSuccess?.();
    } catch {
      // el error se muestra via crearTurno.error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label>Profesional</label>
        <select value={form.profesional_id} onChange={set('profesional_id')} required>
          <option value="">Seleccionar...</option>
          {profesionales.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Servicio</label>
        <select value={form.servicio_id} onChange={set('servicio_id')} required>
          <option value="">Seleccionar...</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre} ({s.duracion_min} min)</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Cliente</label>
        <select value={form.cliente_id} onChange={set('cliente_id')} required>
          <option value="">Seleccionar...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Fecha y hora</label>
        <input
          type="datetime-local"
          value={form.fecha_hora_inicio}
          onChange={set('fecha_hora_inicio')}
          required
        />
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea value={form.notas} onChange={set('notas')} rows={2} />
      </div>

      {crearTurno.error && (
        <div className="form-error">
          <p>{crearTurno.error.response?.data?.message || 'Error al crear turno'}</p>
          {crearTurno.error.response?.data?.data?.fields?.map((f) => (
            <p key={f.field} style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>• {f.field}: {f.message}</p>
          ))}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={crearTurno.isPending}>
        {crearTurno.isPending ? 'Guardando...' : 'Crear turno'}
      </button>
    </form>
  );
}
