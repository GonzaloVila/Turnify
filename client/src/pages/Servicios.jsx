import { useState } from 'react';
import { useServicios, useDesactivarServicio } from '../hooks/useServicios';
import ServicioCard from '../components/servicios/ServicioCard';
import ServicioForm from '../components/servicios/ServicioForm';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Servicios() {
  const { data: servicios = [], isLoading } = useServicios();
  const desactivar = useDesactivarServicio();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const handleEditar = (servicio) => {
    setEditando(servicio);
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
        <h1 className="page-title">Servicios</h1>
        <button className="btn btn-primary" onClick={handleNuevo}>
          + Agregar servicio
        </button>
      </div>

      {servicios.length === 0 ? (
        <p className="empty-state">No hay servicios registrados.</p>
      ) : (
        <div className="cards-grid">
          {servicios.map((s) => (
            <ServicioCard
              key={s.id}
              servicio={s}
              onEditar={handleEditar}
              onDesactivar={(id) => desactivar.mutate(id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editando ? 'Editar servicio' : 'Nuevo servicio'}
      >
        <ServicioForm servicio={editando} onSuccess={() => setModal(false)} />
      </Modal>
    </div>
  );
}
