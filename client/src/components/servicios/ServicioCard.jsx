export default function ServicioCard({ servicio, onEditar, onDesactivar }) {
  const color = servicio.color || '#3b82f6';

  return (
    <div className="card servicio-card">
      <div className="card-body">
        <div className="servicio-card-top">
          <div
            className="servicio-icon"
            style={{ backgroundColor: `${color}14`, color }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="servicio-info">
            <h3 className="servicio-nombre">{servicio.nombre}</h3>
            {servicio.descripcion && <p className="servicio-desc">{servicio.descripcion}</p>}
          </div>
        </div>
        <div className="servicio-meta">
          <div className="servicio-meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{servicio.duracion_min} min</span>
          </div>
          {servicio.precio && (
            <div className="servicio-meta-item servicio-precio">
              ${Number(servicio.precio).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      <div className="card-actions">
        <button className="btn-sm btn-secondary" onClick={() => onEditar(servicio)}>
          Editar
        </button>
        <button className="btn-sm btn-danger" onClick={() => onDesactivar(servicio.id)}>
          Desactivar
        </button>
      </div>
    </div>
  );
}
