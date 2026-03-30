import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiLogoutBoxLine, RiDashboardLine } from 'react-icons/ri';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const dashPath = user?.role === 'TEACHER' ? '/teacher' : '/dashboard';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="dot" />
          SmartExam
        </Link>

        {isAuthenticated && user && (
          <div className="navbar-links">
            <Link to={dashPath}>
              <button className="nav-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <RiDashboardLine size={13} />
                Dashboard
              </button>
            </Link>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{user.name}</span>
            <button className="nav-pill" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RiLogoutBoxLine size={13} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
