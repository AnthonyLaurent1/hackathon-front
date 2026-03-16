import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navSections = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sites', label: 'Sites' },
  { to: '/compare', label: 'Comparaison' },
  { to: '/history', label: 'Historique' },
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>CarbonHack</h1>
        <div className="user-chip">{user?.email || 'Invité'}</div>
        <nav>
          {navSections.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn-ghost" onClick={handleLogout}>
          Déconnexion
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
