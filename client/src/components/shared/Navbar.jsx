import { useAuth } from '../../hooks/useAuth';
import { useContext } from 'react';
import { NegocioContext } from '../../context/NegocioContext';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { negocio } = useContext(NegocioContext);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuToggle} aria-label="Menú">
          <span /><span /><span />
        </button>
        <div className="navbar-brand">{negocio?.nombre || 'Turnify'}</div>
      </div>
      <div className="navbar-user">
        <span className="navbar-username">{user?.nombre}</span>
        <span className="role-badge">{user?.rol}</span>
        <button onClick={logout} className="btn-logout">Salir</button>
      </div>
    </header>
  );
}
