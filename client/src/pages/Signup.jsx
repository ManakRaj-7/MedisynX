import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../api/api';
import { setToken } from '../utils/auth';

const Signup = () => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await apiPost('/auth/signup', { name, specialization, email, password });
      if (result.accessToken) {
        setToken(result.accessToken);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Signup failed.');
      }
    } catch (err) {
      setError('Unable to sign up. Please try again.');
    }
  };

  return (
    <div className="page-card">
      <h1>Doctor Signup</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Specialization
          <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="message error">{error}</div>}
        <button type="submit" className="btn primary">Signup</button>
      </form>
      <div className="auth-links">
        <Link to="/login">Already have an account?</Link>
        <Link to="/guest">Continue as guest</Link>
      </div>
    </div>
  );
};

export default Signup;
