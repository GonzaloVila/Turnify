import { useState, useEffect, useContext } from 'react';
import { format, differenceInMinutes, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTurnos } from '../hooks/useTurnos';
import { useClientes } from '../hooks/useClientes';
import { useAuth } from '../hooks/useAuth';
import { NegocioContext } from '../context/NegocioContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import TurnoEstadoBadge from '../components/turnos/TurnoEstadoBadge';
import Modal from '../components/shared/Modal';
import TurnoForm from '../components/turnos/TurnoForm';

const DOT_COLORS = {
  PENDIENTE: '#f59e0b',
  CONFIRMADO: '#3b82f6',
  COMPLETADO: '#10b981',
  CANCELADO: '#ef4444',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { negocio } = useContext(NegocioContext);
  const [now, setNow] = useState(new Date());
  const [crearModal, setCrearModal] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const hoy = format(now, 'yyyy-MM-dd');
  const { data: turnosHoy = [], isLoading: loadingTurnos, refetch } = useTurnos({ fecha: hoy });
  const { data: turnosPendientes = [] } = useTurnos({ estado: 'PENDIENTE' });
  const { data: clientes = [], isLoading: loadingClientes } = useClientes();

  if (loadingTurnos || loadingClientes) return <LoadingSpinner />;

  const turnosOrdenados = [...turnosHoy].sort(
    (a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio)
  );

  const proximoTurno = turnosOrdenados.find(t => !isPast(new Date(t.fecha_hora_inicio)));

  const minutosRestantes = proximoTurno
    ? differenceInMinutes(new Date(proximoTurno.fecha_hora_inicio), now)
    : null;

  const workStart = new Date(now); workStart.setHours(8, 0, 0, 0);
  const workEnd = new Date(now); workEnd.setHours(20, 0, 0, 0);
  const workProgress = Math.min(100, Math.max(0, ((now - workStart) / (workEnd - workStart)) * 100));

  const firstName = user?.nombre?.split(' ')[0] ?? '';

  return (
    <div className="page">
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="dash-date">
            {format(now, "EEEE d 'de' MMMM yyyy", { locale: es })}
            {' · '}
            {turnosHoy.length} turno{turnosHoy.length !== 1 ? 's' : ''} programado{turnosHoy.length !== 1 ? 's' : ''} para hoy
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCrearModal(true)}>
          + Nuevo turno
        </button>
      </div>

      <div className="dash-grid">
        <div className="dash-left">
          {proximoTurno ? (
            <div className="dash-next-card">
              <div className="dash-next-label">Próximo turno</div>
              <div className="dash-next-time">
                {format(new Date(proximoTurno.fecha_hora_inicio), 'HH:mm')}
              </div>
              <div className="dash-next-name">{proximoTurno.cliente?.nombre}</div>
              <div className="dash-next-meta">
                {proximoTurno.servicio?.nombre}
                {proximoTurno.profesional?.nombre ? ` · ${proximoTurno.profesional.nombre}` : ''}
              </div>
              {minutosRestantes !== null && (
                <div className="dash-next-countdown">
                  ⏱ En {minutosRestantes < 1 ? 'menos de 1' : minutosRestantes} minuto{minutosRestantes !== 1 ? 's' : ''}
                </div>
              )}
              <div className="dash-next-progress">
                <div className="dash-next-progress-fill" style={{ width: `${workProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="dash-no-next">
              <p style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>✓</p>
              <p style={{ fontWeight: 600, color: 'var(--gray-700)' }}>No hay más turnos por hoy</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Todo al día</p>
            </div>
          )}

          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-n">{turnosHoy.length}</div>
              <div className="dash-stat-l">Hoy</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-n">{turnosPendientes.length}</div>
              <div className="dash-stat-l">Pendientes</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-n">{clientes.length}</div>
              <div className="dash-stat-l">Clientes</div>
            </div>
          </div>
        </div>

        <div className="dash-timeline">
          <div className="dash-tl-header">
            <span className="dash-tl-title">Agenda de hoy</span>
            <span className="dash-tl-count">{turnosHoy.length} turnos</span>
          </div>
          {turnosOrdenados.length === 0 ? (
            <p className="empty-state">No hay turnos para hoy.</p>
          ) : (
            turnosOrdenados.map((t) => {
              const fechaInicio = new Date(t.fecha_hora_inicio);
              const pasado = isPast(fechaInicio);
              const esProximo = proximoTurno?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`dash-tl-item${esProximo ? ' is-next' : ''}${pasado && !esProximo ? ' is-past' : ''}`}
                >
                  <span className="dash-tl-time">{format(fechaInicio, 'HH:mm')}</span>
                  <span className="dash-tl-dot" style={{ background: DOT_COLORS[t.estado] ?? '#d1d5db' }} />
                  <div className="dash-tl-info">
                    <span className="dash-tl-client">{t.cliente?.nombre}</span>
                    <span className="dash-tl-srv">{t.servicio?.nombre}</span>
                  </div>
                  <TurnoEstadoBadge estado={t.estado} />
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={crearModal} onClose={() => setCrearModal(false)} title="Nuevo turno">
        <TurnoForm onSuccess={() => { setCrearModal(false); refetch(); }} />
      </Modal>
    </div>
  );
}
