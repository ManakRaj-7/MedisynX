import { Link } from 'react-router-dom';
import { logout, isAuthenticated } from '../utils/auth';

const NavBar = () => {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="nav-bar">
      <div className="brand">MedisynX</div>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/patients">Patients</Link>
        <Link to="/appointments">Appointments</Link>
        <Link to="/billing">Billing</Link>
        <Link to="/ai-assistant">AI Assistant</Link>
      </div>
      <div className="nav-actions">
        {isAuthenticated() ? (
          <button className="btn secondary" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link className="btn secondary" to="/login">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default NavBar;
