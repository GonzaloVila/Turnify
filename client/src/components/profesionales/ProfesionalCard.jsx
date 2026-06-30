export default function ProfesionalCard({ profesional, onEditar, onDesactivar }) {
  const DIAS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const activeDays = new Set(profesional.horarios?.map((h) => h.dia_semana) || []);

  const getTimeSummary = () => {
    if (!profesional.horarios?.length) return null;
    const ranges = {};
    profesional.horarios.forEach((h) => {
      const key = `${h.hora_inicio.slice(0, 5)}-${h.hora_fin.slice(0, 5)}`;
      if (!ranges[key]) ranges[key] = [];
      ranges[key].push(h.dia_semana);
    });
    return Object.entries(ranges).map(([range]) => {
      const [start, end] = range.split('-');
      return `${start} - ${end}`;
    });
  };

  const timeSummary = getTimeSummary();

  return (
    <div className="card profesional-card">
      <div className="card-body">
        <div className="prof-header">
          {profesional.avatar_url ? (
            <img src={profesional.avatar_url} alt={profesional.nombre} className="prof-avatar" />
          ) : (
            <div className="prof-avatar-placeholder">{profesional.nombre[0]}</div>
          )}
          <div className="prof-info">
            <h3 className="prof-nombre">{profesional.nombre}</h3>
            {profesional.especialidad && (
              <p className="prof-especialidad">{profesional.especialidad}</p>
            )}
          </div>
        </div>

        {profesional.horarios?.length > 0 && (
          <div className="prof-schedule">
            <div className="prof-week">
              {DIAS_SHORT.map((d, i) => (
                <span key={i} className={`prof-day${activeDays.has(i) ? ' active' : ''}`}>
                  {d}
                </span>
              ))}
            </div>
            {timeSummary && (
              <div className="prof-time-summary">
                {timeSummary.map((t, i) => (
                  <span key={i} className="prof-time">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
