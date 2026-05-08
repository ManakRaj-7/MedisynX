import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api/api';
import { setToken, setUser } from '../utils/auth';
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiPost('/auth/login', { email, password });
      if (result.accessToken) {
        setToken(result.accessToken);
        setUser(result.doctor);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-dot"></div>
            <span>MedisynX</span>
          </div>
          <p className="auth-subtitle">AI-Powered Healthcare Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/signup" className="auth-link">
            New here? <strong>Create Account</strong>
          </Link>
          <div className="auth-divider"><span>or</span></div>
          <Link to="/guest" className="btn btn-ghost btn-full">
            <Sparkles size={16} /> Explore Guest Demo
          </Link>
        </div>
      </div>
      <p className="auth-copyright">&copy; 2026 MedisynX Systems</p>
    </div>
  );
};

export default Login;
