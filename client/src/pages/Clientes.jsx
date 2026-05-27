import { useState } from 'react';
import { useClientes, useCliente } from '../hooks/useClientes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import TurnoEstadoBadge from '../components/turnos/TurnoEstadoBadge';

function ClienteDetalle({ clienteId }) {
  const { data: cliente, isLoading } = useCliente(clienteId);
  if (isLoading) return <LoadingSpinner />;
  if (!cliente) return null;

  return (
    <div>
      <p><strong>Email:</strong> {cliente.email || '—'}</p>
      <p><strong>Teléfono:</strong> {cliente.telefono || '—'}</p>
      {cliente.notas && <p><strong>Notas:</strong> {cliente.notas}</p>}

      <h3 style={{ marginTop: '1rem' }}>Historial de turnos</h3>
      {cliente.turnos?.length === 0 ? (
        <p>Sin turnos registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Fecha</th><th>Servicio</th><th>Profesional</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {cliente.turnos?.map((t) => (
              <tr key={t.id}>
                <td>{format(new Date(t.fecha_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: es })}</td>
                <td>{t.servicio?.nombre}</td>
                <td>{t.profesional?.nombre}</td>
                <td><TurnoEstadoBadge estado={t.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Clientes() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [clienteId, setClienteId] = useState(null);

  const { data: clientes = [], isLoading } = useClientes(debouncedSearch);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(() => setDebouncedSearch(e.target.value), 400);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={handleSearch}
          className="filter-input filter-input--wide"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : clientes.length === 0 ? (
        <p className="empty-state">No se encontraron clientes.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.email || '—'}</td>
                <td>{c.telefono || '—'}</td>
                <td>
                  <button className="btn-sm btn-secondary" onClick={() => setClienteId(c.id)}>
                    Ver historial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={!!clienteId} onClose={() => setClienteId(null)} title="Detalle del cliente">
        {clienteId && <ClienteDetalle clienteId={clienteId} />}
      </Modal>
    </div>
  );
}
