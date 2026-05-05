import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api/api';
import { setToken } from '../utils/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await apiPost('/auth/login', { email, password });
      if (result.accessToken) {
        setToken(result.accessToken);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed.');
      }
    } catch (err) {
      setError('Unable to login. Please try again.');
    }
  };

  return (
    <div className="page-card">
      <h1>Doctor Login</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="message error">{error}</div>}
        <button type="submit" className="btn primary">Login</button>
      </form>
      <div className="auth-links">
        <Link to="/signup">Create account</Link>
        <Link to="/guest">Continue as guest</Link>
      </div>
    </div>
  );
};

export default Login;
