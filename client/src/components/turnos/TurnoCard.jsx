import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TurnoEstadoBadge from './TurnoEstadoBadge';

export default function TurnoCard({ turno, onCambiarEstado, onEliminar }) {
  return (
    <div className="turno-card">
      <div className="turno-card-header">
        <span className="turno-hora">
          {format(new Date(turno.fecha_hora_inicio), 'HH:mm', { locale: es })}
        </span>
        <TurnoEstadoBadge estado={turno.estado} />
      </div>
      <div className="turno-card-body">
        <p className="turno-cliente">{turno.cliente?.nombre}</p>
        <p className="turno-servicio">{turno.servicio?.nombre}</p>
        <p className="turno-profesional">con {turno.profesional?.nombre}</p>
      </div>
      <div className="turno-card-actions">
        <button onClick={() => onCambiarEstado(turno.id, 'CONFIRMADO')} className="btn-sm btn-primary">
          Confirmar
        </button>
        <button onClick={() => onCambiarEstado(turno.id, 'COMPLETADO')} className="btn-sm btn-success">
          Completar
        </button>
        <button onClick={() => onCambiarEstado(turno.id, 'CANCELADO')} className="btn-sm btn-danger">
          Cancelar
        </button>
        {onEliminar && (
          <button onClick={() => onEliminar(turno.id)} className="btn-sm btn-ghost">
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
