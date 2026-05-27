import { useState } from 'react';
import { useTurnos, useCambiarEstado } from '../hooks/useTurnos';
import CalendarView from '../components/calendar/CalendarView';
import Modal from '../components/shared/Modal';
import TurnoForm from '../components/turnos/TurnoForm';
import TurnoEstadoBadge from '../components/turnos/TurnoEstadoBadge';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { format } from 'date-fns';

export default function Agenda() {
  const { data: turnos = [], isLoading } = useTurnos({});
  const cambiarEstado = useCambiarEstado();

  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [crearModal, setCrearModal] = useState(false);
  const [slotInicial, setSlotInicial] = useState(null);

  const handleSelectSlot = ({ start }) => {
    setSlotInicial(start);
    setCrearModal(true);
  };

  const handleSelectEvent = (event) => setTurnoSeleccionado(event.resource);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Agenda</h1>
        <button className="btn btn-primary" onClick={() => setCrearModal(true)}>
          + Nuevo turno
        </button>
      </div>

      <CalendarView
        turnos={turnos}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
      />

      <Modal isOpen={crearModal} onClose={() => { setCrearModal(false); setSlotInicial(null); }} title="Nuevo turno">
        <TurnoForm fechaInicial={slotInicial} onSuccess={() => setCrearModal(false)} />
      </Modal>

      <Modal isOpen={!!turnoSeleccionado} onClose={() => setTurnoSeleccionado(null)} title="Detalle del turno">
        {turnoSeleccionado && (
          <div className="turno-detalle">
            <p><strong>Cliente:</strong> {turnoSeleccionado.cliente?.nombre}</p>
            <p><strong>Servicio:</strong> {turnoSeleccionado.servicio?.nombre}</p>
            <p><strong>Profesional:</strong> {turnoSeleccionado.profesional?.nombre}</p>
            <p><strong>Inicio:</strong> {format(new Date(turnoSeleccionado.fecha_hora_inicio), 'dd/MM/yyyy HH:mm')}</p>
            <p><strong>Fin:</strong> {format(new Date(turnoSeleccionado.fecha_hora_fin), 'HH:mm')}</p>
            <p><strong>Estado:</strong> <TurnoEstadoBadge estado={turnoSeleccionado.estado} /></p>

            <div className="turno-acciones">
              {['CONFIRMADO', 'COMPLETADO', 'CANCELADO', 'AUSENTE'].map((e) => (
                <button
                  key={e}
                  className="btn-sm btn-secondary"
                  onClick={() => {
                    cambiarEstado.mutate({ id: turnoSeleccionado.id, estado: e });
                    setTurnoSeleccionado(null);
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
