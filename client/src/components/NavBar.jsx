import { NavLink, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../utils/auth';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Bot, 
  LogOut, 
  LogIn,
  UserCircle
} from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const auth = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav-bar">
      <div className="brand">
        <span>MedisynX</span>
      </div>
      
      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/patients" className={({ isActive }) => isActive ? 'active' : ''}>
          <Users size={20} />
          <span>Patients</span>
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => isActive ? 'active' : ''}>
          <Calendar size={20} />
          <span>Appointments</span>
        </NavLink>
        <NavLink to="/billing" className={({ isActive }) => isActive ? 'active' : ''}>
          <CreditCard size={20} />
          <span>Billing</span>
        </NavLink>
        <NavLink to="/ai-assistant" className={({ isActive }) => isActive ? 'active' : ''}>
          <Bot size={20} />
          <span>AI Assistant</span>
        </NavLink>
      </div>

      <div className="nav-actions">
        {auth ? (
          <>
            <div className="nav-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
              <UserCircle size={20} />
              <span>Dr. Smith</span>
            </div>
            <button className="btn secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <NavLink className="btn primary" to="/login" style={{ width: '100%' }}>
            <LogIn size={20} />
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
