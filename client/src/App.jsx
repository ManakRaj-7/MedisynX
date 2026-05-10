import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GuestDemo from './pages/GuestDemo';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { isAuthenticated } from './utils/auth';
import { Sun, Moon } from 'lucide-react';

const Protected = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();
  const authPages = ['/login', '/signup', '/guest'];
  const hideNav = authPages.includes(location.pathname);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="app-shell">
      {!hideNav && <NavBar />}
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="btn btn-ghost theme-toggle-btn"
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          padding: 0,
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)'
        }}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <main className={hideNav ? 'auth-main' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/guest" element={<GuestDemo />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/patients" element={<Protected><Patients /></Protected>} />
          <Route path="/appointments" element={<Protected><Appointments /></Protected>} />
          <Route path="/billing" element={<Protected><Billing /></Protected>} />
          <Route path="/ai-assistant" element={<Protected><AIAssistant /></Protected>} />
          <Route path="/medical-records" element={<Protected><MedicalRecords /></Protected>} />
          <Route path="/prescriptions" element={<Protected><Prescriptions /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
