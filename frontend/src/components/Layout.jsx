import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <nav className="nav">
        <span className="nav-brand">XWZ Parking</span>
        <div className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/parkings">Parkings</NavLink>
          {isAdmin && <NavLink to="/parkings/register">Register Parking</NavLink>}
          <NavLink to="/entries/new">Car Entry</NavLink>
          <NavLink to="/entries/exit">Car Exit</NavLink>
          {isAdmin && <NavLink to="/reports">Reports</NavLink>}
          <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            {user?.firstName} ({user?.role?.replace('_', ' ')})
          </span>
          <button type="button" className="btn btn-secondary" style={{ height: 36 }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="container">{children}</main>
    </>
  );
}
