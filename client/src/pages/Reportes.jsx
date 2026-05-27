import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import LoadingSpinner from '../components/shared/LoadingSpinner';

function useReportes() {
  const resumen = useQuery({ queryKey: ['reportes', 'resumen'], queryFn: () => api.get('/reportes/resumen').then((r) => r.data.data) });
  const ingresos = useQuery({ queryKey: ['reportes', 'ingresos'], queryFn: () => api.get('/reportes/ingresos').then((r) => r.data.data) });
  const clientesNuevos = useQuery({ queryKey: ['reportes', 'clientes-nuevos'], queryFn: () => api.get('/reportes/clientes-nuevos').then((r) => r.data.data) });
  return { resumen, ingresos, clientesNuevos };
}

export default function Reportes() {
  const { resumen, ingresos, clientesNuevos } = useReportes();

  if (resumen.isLoading) return <LoadingSpinner />;

  const r = resumen.data || {};
  const ingresosData = ingresos.data || [];
  const clientesData = clientesNuevos.data || [];

  return (
    <div className="page">
      <h1 className="page-title">Reportes</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total turnos (mes)</p>
          <p className="stat-value">{r.total ?? '—'}</p>
        </div>
        {Object.entries(r.porEstado || {}).map(([estado, count]) => (
          <div key={estado} className="stat-card">
            <p className="stat-label">{estado}</p>
            <p className="stat-value">{count}</p>
          </div>
        ))}
      </div>

      <div className="section">
        <h2>Ingresos por mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ingresosData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="total" name="Ingresos ($)" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="section">
        <h2>Clientes nuevos por mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clientesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="Clientes nuevos" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="section">
        <h2>Turnos por profesional (este mes)</h2>
        <table className="table">
          <thead>
            <tr><th>Profesional</th><th>Turnos</th></tr>
          </thead>
          <tbody>
            {Object.entries(r.porProfesional || {}).map(([nombre, count]) => (
              <tr key={nombre}><td>{nombre}</td><td>{count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
