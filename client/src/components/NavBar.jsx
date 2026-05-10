import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated, getUser } from '../utils/auth';
import {
  LayoutDashboard, Users, Calendar, CreditCard, Bot,
  LogOut, LogIn, UserCircle, Download, FileText, Pill, BarChart3, Settings as SettingsIcon, Menu, X
} from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const auth = isAuthenticated();
  const user = getUser();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavClick = () => setIsMobileOpen(false);

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
    <>
      <div className="mobile-header">
        <div className="sidebar-logo" style={{ marginBottom: 0, padding: 0 }}>
          <div className="logo-dot"></div>
          <span>MedisynX</span>
        </div>
        <button className="btn btn-ghost" onClick={() => setIsMobileOpen(true)} style={{ padding: '0.5rem' }}>
          <Menu size={24} />
        </button>
      </div>

      {isMobileOpen && <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)}></div>}

      <nav className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo mobile-hidden">
          <div className="logo-dot"></div>
          <span>MedisynX</span>
        </div>
        
        {isMobileOpen && (
           <button className="btn btn-ghost mobile-close" onClick={() => setIsMobileOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem' }}>
             <X size={24} />
           </button>
        )}

      <div className="sidebar-nav" style={{ marginTop: isMobileOpen ? '2rem' : '0' }}>
        <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/patients" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <Users size={20} />
          <span>Patients</span>
        </NavLink>
        <NavLink to="/appointments" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <Calendar size={20} />
          <span>Appointments</span>
        </NavLink>
        <NavLink to="/billing" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <CreditCard size={20} />
          <span>Billing</span>
        </NavLink>
        <NavLink to="/medical-records" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <FileText size={20} />
          <span>Medical Records</span>
        </NavLink>
        <NavLink to="/prescriptions" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <Pill size={20} />
          <span>Prescriptions</span>
        </NavLink>
        <NavLink to="/analytics" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/ai-assistant" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <Bot size={20} />
          <span>Clinical AI</span>
        </NavLink>
        <NavLink to="/settings" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
        <NavLink to="/profile" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
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
    </>
  );
};

export default NavBar;
