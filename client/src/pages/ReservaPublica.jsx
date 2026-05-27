import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const pub = (slug) => `${BASE}/publico/${slug}`;

const PASOS = ['Servicio', 'Profesional', 'Horario', 'Tus datos', 'Listo'];

const CAMPOS = [
  { key: 'nombre', label: 'Nombre completo', type: 'text', placeholder: 'Ej: María García' },
  { key: 'email', label: 'Email (opcional)', type: 'email', placeholder: 'Ej: maria@email.com' },
  { key: 'telefono', label: 'Teléfono', type: 'tel', placeholder: 'Ej: 11 2345-6789' },
];

export default function ReservaPublica() {
  const { slug } = useParams();
  const [paso, setPaso] = useState(0);
  const [negocio, setNegocio] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [slots, setSlots] = useState([]);
  const [seleccion, setSeleccion] = useState({
    servicio: null, profesional: null, fecha: '', slot: '',
    cliente: { nombre: '', email: '', telefono: '' },
  });
  const [turnoConfirmado, setTurnoConfirmado] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(pub(slug)).then((r) => setNegocio(r.data.data)).catch(() => setNegocio(null));
    axios.get(`${pub(slug)}/servicios`).then((r) => setServicios(r.data.data));
    axios.get(`${pub(slug)}/profesionales`).then((r) => setProfesionales(r.data.data));
  }, [slug]);

  const cargarSlots = async () => {
    const { profesional, servicio, fecha } = seleccion;
    if (!profesional || !servicio || !fecha) return;
    const r = await axios.get(`${pub(slug)}/disponibilidad`, {
      params: { profesional_id: profesional.id, servicio_id: servicio.id, fecha },
    });
    setSlots(r.data.data?.slots || []);
  };

  const confirmar = async () => {
    setLoading(true);
    setError('');
    try {
      const { profesional, servicio, fecha, slot, cliente } = seleccion;
      const fecha_hora_inicio = new Date(`${fecha}T${slot}:00`).toISOString();
      const r = await axios.post(`${pub(slug)}/reservar`, {
        profesional_id: profesional.id,
        servicio_id: servicio.id,
        fecha_hora_inicio,
        cliente,
      });
      setTurnoConfirmado(r.data.data);
      setPaso(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reservar');
    } finally {
      setLoading(false);
    }
  };

  if (!negocio) return (
    <div className="reserva-bg">
      <div className="reserva-page">
        <div className="reserva-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Cargando...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reserva-bg">
      <div className="reserva-page">
        <div className="reserva-card">
          <div className="reserva-header">
            {negocio.logo_url && <img src={negocio.logo_url} alt={negocio.nombre} className="reserva-logo" />}
            <h1>{negocio.nombre}</h1>
            {negocio.descripcion && <p>{negocio.descripcion}</p>}
          </div>

          <div className="reserva-steps">
            {PASOS.map((s, i) => (
              <span key={s} className={`step ${i === paso ? 'active' : ''} ${i < paso ? 'done' : ''}`}>
                <span className="step-num">{i < paso ? '✓' : i + 1}</span>
                <span className="step-label">{s}</span>
              </span>
            ))}
          </div>

          <div className="reserva-body">
            {paso === 0 && (
              <div>
                <h2 className="reserva-section-title">¿Qué servicio necesitás?</h2>
                <div className="cards-grid">
                  {servicios.map((s) => (
                    <div
                      key={s.id}
                      className={`card selectable reserva-srv-card ${seleccion.servicio?.id === s.id ? 'selected' : ''}`}
                      onClick={() => setSeleccion((p) => ({ ...p, servicio: s }))}
                    >
                      <strong>{s.nombre}</strong>
                      <div className="reserva-srv-meta">
                        <span>⏱ {s.duracion_min} min</span>
                        {s.precio && <span>${Number(s.precio).toFixed(0)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary btn-full" disabled={!seleccion.servicio} onClick={() => setPaso(1)}>
                  Continuar →
                </button>
              </div>
            )}

            {paso === 1 && (
              <div>
                <h2 className="reserva-section-title">¿Con quién y cuándo?</h2>
                <div className="cards-grid">
                  {profesionales.map((p) => (
                    <div
                      key={p.id}
                      className={`card selectable reserva-prof-card ${seleccion.profesional?.id === p.id ? 'selected' : ''}`}
                      onClick={() => setSeleccion((prev) => ({ ...prev, profesional: p }))}
                    >
                      <div className="reserva-prof-avatar">{p.nombre.charAt(0)}</div>
                      <strong>{p.nombre}</strong>
                      {p.especialidad && <span className="text-muted">{p.especialidad}</span>}
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>¿Qué día?</label>
                  <input
                    type="date"
                    value={seleccion.fecha}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSeleccion((p) => ({ ...p, fecha: e.target.value }))}
                  />
                </div>
                <div className="btn-group">
                  <button className="btn btn-ghost" onClick={() => setPaso(0)}>← Atrás</button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={!seleccion.profesional || !seleccion.fecha}
                    onClick={() => { cargarSlots(); setPaso(2); }}
                  >
                    Ver horarios disponibles →
                  </button>
                </div>
              </div>
            )}

            {paso === 2 && (
              <div>
                <h2 className="reserva-section-title">¿A qué hora?</h2>
                {slots.length === 0 ? (
                  <div className="reserva-empty">
                    <p>No hay horarios disponibles para esa fecha.</p>
                    <p className="text-muted" style={{ marginTop: '0.3rem' }}>Probá elegir otro día o profesional.</p>
                  </div>
                ) : (
                  <div className="slots-grid">
                    {slots.map((s) => (
                      <button
                        key={s}
                        className={`slot-btn ${seleccion.slot === s ? 'selected' : ''}`}
                        onClick={() => setSeleccion((p) => ({ ...p, slot: s }))}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="btn-group">
                  <button className="btn btn-ghost" onClick={() => setPaso(1)}>← Atrás</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} disabled={!seleccion.slot} onClick={() => setPaso(3)}>
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {paso === 3 && (
              <div>
                <h2 className="reserva-section-title">Tus datos de contacto</h2>
                <div className="form">
                  {CAMPOS.map(({ key, label, type, placeholder }) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={seleccion.cliente[key]}
                        onChange={(e) =>
                          setSeleccion((p) => ({ ...p, cliente: { ...p.cliente, [key]: e.target.value } }))
                        }
                      />
                    </div>
                  ))}
                </div>
                {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
                <div className="btn-group">
                  <button className="btn btn-ghost" onClick={() => setPaso(2)}>← Atrás</button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={!seleccion.cliente.nombre || !seleccion.cliente.telefono || loading}
                    onClick={confirmar}
                  >
                    {loading ? 'Reservando...' : 'Confirmar turno →'}
                  </button>
                </div>
              </div>
            )}

            {paso === 4 && turnoConfirmado && (
              <div className="reserva-confirmacion">
                <div className="reserva-check-icon">✓</div>
                <h2>¡Turno confirmado!</h2>
                <p className="text-muted">Anotá los datos de tu reserva.</p>
                <div className="confirmacion-detalle">
                  <p><strong>Servicio:</strong> {turnoConfirmado.servicio?.nombre}</p>
                  <p><strong>Profesional:</strong> {turnoConfirmado.profesional?.nombre}</p>
                  <p><strong>Fecha y hora:</strong> {new Date(turnoConfirmado.fecha_hora_inicio).toLocaleString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <p style={{ marginTop: '1rem' }}>Te esperamos en <strong>{negocio.direccion || negocio.nombre}</strong>.</p>
              </div>
            )}
          </div>
        </div>

        <p className="reserva-footer">Reservas gestionadas con Turnify</p>
      </div>
    </div>
  );
}
