export default function ServicioCard({ servicio, onEditar, onDesactivar }) {
  return (
    <div className="card servicio-card">
      <div className="servicio-color-bar" style={{ backgroundColor: servicio.color || '#3b82f6' }} />
      <div className="card-body">
        <h3>{servicio.nombre}</h3>
        {servicio.descripcion && <p className="text-muted">{servicio.descripcion}</p>}
        <div className="servicio-meta">
          <span>{servicio.duracion_min} min</span>
          {servicio.precio && <span>${Number(servicio.precio).toFixed(2)}</span>}
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
