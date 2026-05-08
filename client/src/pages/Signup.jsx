import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api/api';
import { setToken } from '../utils/auth';
import { UserPlus, Mail, Lock, User, Stethoscope, Activity } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
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
      const result = await apiPost('/auth/signup', { name, specialization, email, password });
      if (result.accessToken) {
        setToken(result.accessToken);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed. Email might be in use.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
      <div className="page-card" style={{ margin: 0, padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '2.2rem' }}>
            <span>MedisynX</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Join the future of healthcare intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: 'none' }}>
          <label>
            Full Name
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Dr. Jane Doe"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </label>
          <label>
            Specialization
            <div style={{ position: 'relative' }}>
              <Stethoscope size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="e.g. Cardiology"
                value={specialization} 
                onChange={(e) => setSpecialization(e.target.value)} 
                required 
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </label>
          <label>
            Clinical Email
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="jane.doe@hospital.com"
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
                placeholder="Create a strong key"
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
            {loading ? 'Processing...' : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            Already have an account? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
