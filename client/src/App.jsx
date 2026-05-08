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
import { isAuthenticated } from './utils/auth';

const Protected = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();
  const hideNav = ['/login', '/signup', '/guest'].includes(location.pathname);

  return (
    <div className="app-shell" style={{ display: hideNav ? 'block' : 'flex' }}>
      {!hideNav && <NavBar />}
      <main className="app-content" style={{ 
        marginLeft: hideNav ? '0' : '260px',
        padding: hideNav ? '0' : '3rem 4rem',
        display: hideNav ? 'flex' : 'block',
        alignItems: hideNav ? 'center' : 'initial',
        justifyContent: hideNav ? 'center' : 'initial',
        minHeight: '100vh',
        width: hideNav ? '100%' : 'auto'
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/guest" element={<GuestDemo />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/patients"
            element={
              <Protected>
                <Patients />
              </Protected>
            }
          />
          <Route
            path="/appointments"
            element={
              <Protected>
                <Appointments />
              </Protected>
            }
          />
          <Route
            path="/billing"
            element={
              <Protected>
                <Billing />
              </Protected>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <Protected>
                <AIAssistant />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
