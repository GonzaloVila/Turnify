export default function ProfesionalCard({ profesional, onEditar, onDesactivar }) {
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="card profesional-card">
      <div className="card-header">
        {profesional.avatar_url ? (
          <img src={profesional.avatar_url} alt={profesional.nombre} className="avatar" />
        ) : (
          <div className="avatar-placeholder">{profesional.nombre[0]}</div>
        )}
        <div>
          <h3>{profesional.nombre}</h3>
          {profesional.especialidad && <p className="text-muted">{profesional.especialidad}</p>}
        </div>
      </div>

      {profesional.horarios?.length > 0 && (
        <div className="horarios-preview">
          {profesional.horarios.map((h) => (
            <span key={h.id} className="horario-chip">
              {DIAS[h.dia_semana]} {h.hora_inicio}–{h.hora_fin}
            </span>
          ))}
        </div>
      )}

      <div className="card-actions">
        <button className="btn-sm btn-secondary" onClick={() => onEditar(profesional)}>
          Editar
        </button>
        <button className="btn-sm btn-danger" onClick={() => onDesactivar(profesional.id)}>
          Desactivar
        </button>
      </div>
    </div>
  );
}
