import { useState } from 'react';
import { useProfesionales, useDesactivarProfesional } from '../hooks/useProfesionales';
import ProfesionalCard from '../components/profesionales/ProfesionalCard';
import ProfesionalForm from '../components/profesionales/ProfesionalForm';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Profesionales() {
  const { data: profesionales = [], isLoading } = useProfesionales();
  const desactivar = useDesactivarProfesional();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const handleEditar = (profesional) => {
    setEditando(profesional);
    setModal(true);
  };

  const handleNuevo = () => {
    setEditando(null);
    setModal(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profesionales</h1>
        <button className="btn btn-primary" onClick={handleNuevo}>
          + Agregar profesional
        </button>
      </div>

      {profesionales.length === 0 ? (
        <p className="empty-state">No hay profesionales registrados.</p>
      ) : (
        <div className="cards-grid">
          {profesionales.map((p) => (
            <ProfesionalCard
              key={p.id}
              profesional={p}
              onEditar={handleEditar}
              onDesactivar={(id) => desactivar.mutate(id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editando ? 'Editar profesional' : 'Nuevo profesional'}
      >
        <ProfesionalForm profesional={editando} onSuccess={() => setModal(false)} />
      </Modal>
    </div>
  );
}
