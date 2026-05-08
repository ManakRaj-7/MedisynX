import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api/api';
import { setToken } from '../utils/auth';
import { LogIn, Mail, Lock, Activity, Sparkles } from 'lucide-react';

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
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please verify your server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
      <div className="page-card" style={{ margin: 0, padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '2.2rem' }}>
            <span>MedisynX</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Advanced Healthcare Intelligence Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: 'none' }}>
          <label>
            Clinical Email
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="doctor@medisynx.ai"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </label>
          <label>
            Security Key
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </label>
          
          {error && (
            <div className="message error" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={14} /> {error}
            </div>
          )}

          <button type="submit" className="btn primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Authenticating...' : (
              <><LogIn size={18} /> Enter Dashboard</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/signup" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Request Access</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--glass-border)' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--glass-border)' }} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--glass-border)' }} />
          </div>
          <Link to="/guest" className="btn secondary" style={{ width: '100%', border: 'none' }}>
            <Sparkles size={16} color="var(--primary)" /> Try Guest Demo
          </Link>
        </div>
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.5 }}>
        &copy; 2026 MedisynX Systems. Secure Clinical Environment.
      </p>
    </div>
  );
};

export default Login;
