import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TurnoEstadoBadge from './TurnoEstadoBadge';
import { useCambiarEstado, useEliminarTurno } from '../../hooks/useTurnos';

export default function TurnosList({ turnos }) {
  const cambiarEstado = useCambiarEstado();
  const eliminar = useEliminarTurno();

  if (!turnos?.length) return <p className="empty-state">No hay turnos para mostrar.</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Fecha/Hora</th>
          <th>Cliente</th>
          <th>Servicio</th>
          <th>Profesional</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {turnos.map((t) => (
          <tr key={t.id}>
            <td>{format(new Date(t.fecha_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: es })}</td>
            <td>{t.cliente?.nombre}</td>
            <td>{t.servicio?.nombre}</td>
            <td>{t.profesional?.nombre}</td>
            <td><TurnoEstadoBadge estado={t.estado} /></td>
            <td className="actions">
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) cambiarEstado.mutate({ id: t.id, estado: e.target.value });
                  e.target.value = '';
                }}
                className="select-sm"
              >
                <option value="" disabled>Estado</option>
                {['PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO', 'AUSENTE'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                className="btn-sm btn-danger"
                onClick={() => eliminar.mutate(t.id)}
              >
                ✕
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
