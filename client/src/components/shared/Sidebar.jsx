import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/turnos', label: 'Turnos' },
  { to: '/profesionales', label: 'Profesionales' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/reportes', label: 'Reportes', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { to: '/configuracion', label: 'Configuración' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const items = navItems.filter((item) => !item.roles || item.roles.includes(user?.rol));

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar-logo">Turnify</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
