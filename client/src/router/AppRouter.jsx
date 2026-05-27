import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import LoadingSpinner from '../components/shared/LoadingSpinner';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Agenda from '../pages/Agenda';
import Turnos from '../pages/Turnos';
import Profesionales from '../pages/Profesionales';
import Servicios from '../pages/Servicios';
import Clientes from '../pages/Clientes';
import Configuracion from '../pages/Configuracion';
import Reportes from '../pages/Reportes';
import ReservaPublica from '../pages/ReservaPublica';

function RequireRole({ roles }) {
  const { user } = useAuth();
  if (!roles || roles.includes(user?.rol)) return <Outlet />;
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>403 — Sin acceso</h2>
      <p>No tenés permisos para ver esta página.</p>
    </div>
  );
}

export default function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/reservar/:slug" element={<ReservaPublica />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/turnos" element={<Turnos />} />
        <Route path="/profesionales" element={<Profesionales />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route element={<RequireRole roles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route path="/reportes" element={<Reportes />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
