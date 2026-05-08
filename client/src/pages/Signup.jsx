import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api/api';
import { setToken, setUser } from '../utils/auth';
import { UserPlus, Mail, Lock, User, Stethoscope, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
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
        setUser(result.doctor);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed.');
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
          <p className="auth-subtitle">Create Your Clinical Account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="signup-name">Full Name</label>
            <div className="input-wrapper">
              <User size={18} />
              <input id="signup-name" type="text" placeholder="Dr. Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="signup-spec">Specialization</label>
            <div className="input-wrapper">
              <Stethoscope size={18} />
              <input id="signup-spec" type="text" placeholder="e.g. Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="signup-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input id="signup-email" type="email" placeholder="jane@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="signup-pw">Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input id="signup-pw" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          </div>

          {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating...' : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">Already have an account? <strong>Sign In</strong></Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
