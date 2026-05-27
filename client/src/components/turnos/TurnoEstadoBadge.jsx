const COLORES = {
  PENDIENTE: '#f59e0b',
  CONFIRMADO: '#3b82f6',
  CANCELADO: '#ef4444',
  COMPLETADO: '#10b981',
  AUSENTE: '#6b7280',
};

export default function TurnoEstadoBadge({ estado }) {
  return (
    <span
      className="estado-badge"
      style={{ backgroundColor: COLORES[estado] || '#6b7280' }}
    >
      {estado}
    </span>
  );
}
