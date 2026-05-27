import { useState } from 'react';
import { useTurnos } from '../hooks/useTurnos';
import { useProfesionales } from '../hooks/useProfesionales';
import TurnosList from '../components/turnos/TurnosList';
import Modal from '../components/shared/Modal';
import TurnoForm from '../components/turnos/TurnoForm';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Turnos() {
  const { data: profesionales = [] } = useProfesionales();
  const [filtros, setFiltros] = useState({ fecha: '', profesional_id: '', estado: '' });
  const [crearModal, setCrearModal] = useState(false);

  const { data: turnos = [], isLoading } = useTurnos(
    Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''))
  );

  const set = (field) => (e) => setFiltros((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Turnos</h1>
        <button className="btn btn-primary" onClick={() => setCrearModal(true)}>
          + Nuevo turno
        </button>
      </div>

      <div className="filters-bar">
        <input type="date" value={filtros.fecha} onChange={set('fecha')} className="filter-input" />
        <select value={filtros.profesional_id} onChange={set('profesional_id')} className="filter-input">
          <option value="">Todos los profesionales</option>
          {profesionales.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <select value={filtros.estado} onChange={set('estado')} className="filter-input">
          <option value="">Todos los estados</option>
          {['PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO', 'AUSENTE'].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <button className="btn btn-ghost" onClick={() => setFiltros({ fecha: '', profesional_id: '', estado: '' })}>
          Limpiar
        </button>
      </div>

      {isLoading ? <LoadingSpinner /> : <TurnosList turnos={turnos} />}

      <Modal isOpen={crearModal} onClose={() => setCrearModal(false)} title="Nuevo turno">
        <TurnoForm onSuccess={() => setCrearModal(false)} />
      </Modal>
    </div>
  );
}
