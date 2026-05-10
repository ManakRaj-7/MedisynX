import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated, getUser } from '../utils/auth';
import {
  LayoutDashboard, Users, Calendar, CreditCard, Bot,
  LogOut, LogIn, UserCircle, Download, FileText, Pill, BarChart3, Settings as SettingsIcon
} from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const auth = isAuthenticated();
  const user = getUser();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-dot"></div>
        <span>MedisynX</span>
      </div>

      <div className="sidebar-nav">
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
        <NavLink to="/medical-records" className={({ isActive }) => isActive ? 'active' : ''}>
          <FileText size={20} />
          <span>Medical Records</span>
        </NavLink>
        <NavLink to="/prescriptions" className={({ isActive }) => isActive ? 'active' : ''}>
          <Pill size={20} />
          <span>Prescriptions</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/ai-assistant" className={({ isActive }) => isActive ? 'active' : ''}>
          <Bot size={20} />
          <span>Clinical AI</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          <UserCircle size={20} />
          <span>My Profile</span>
        </NavLink>
        {deferredPrompt && (
          <button 
            onClick={handleInstall} 
            className="btn btn-ghost" 
            style={{ 
              marginTop: '1rem', 
              color: 'var(--primary)', 
              borderColor: 'var(--primary-glow)',
              background: 'rgba(6, 182, 212, 0.05)'
            }}
          >
            <Download size={18} />
            <span>Install Desktop App</span>
          </button>
        )}
      </div>

      <div className="sidebar-bottom">
        {auth ? (
          <>
            <div 
              className="sidebar-user" 
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
            >
              <div className="sidebar-user-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : user?.avatarId ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarId}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  initials
                )}
              </div>
              <div className="sidebar-user-info">
                <div className="name">{user?.name || 'Doctor'}</div>
                <div className="role">{user?.specialization || 'Clinician'}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-ghost"
              style={{ 
                marginTop: '0.75rem', 
                width: '100%', 
                justifyContent: 'flex-start',
                color: 'var(--danger)',
                borderColor: 'rgba(239, 68, 68, 0.1)',
                background: 'rgba(239, 68, 68, 0.05)'
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <NavLink to="/login" className="btn btn-primary btn-full">
            <LogIn size={20} />
            <span>Sign In</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
