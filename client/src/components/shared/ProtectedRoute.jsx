import { useContext, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NegocioContext } from '../../context/NegocioContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ChatWidget from '../chat/ChatWidget';

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>403 — Sin acceso</h2>
        <p>No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  const { negocio } = useContext(NegocioContext);

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      {negocio?.slug && <ChatWidget slug={negocio.slug} />}
    </div>
  );
}
