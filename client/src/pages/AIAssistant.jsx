import { useState } from 'react';
import { apiPost } from '../api/api';
import { getToken } from '../utils/auth';

const AIAssistant = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [history, setHistory] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setResult(null);
    try {
      const token = getToken();
      const response = await apiPost('/ai/diagnose', { symptoms, age, gender, history }, token);
      setResult(response);
    } catch (err) {
      setMessage('Unable to get diagnosis at the moment.');
    }
  };

  return (
    <div className="page-card">
      <h1>AI Diagnosis Assistant</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Symptoms
          <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required />
        </label>
        <label>
          Age
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <label>
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Medical History
          <textarea value={history} onChange={(e) => setHistory(e.target.value)} />
        </label>
        <button type="submit" className="btn primary">Get Diagnosis</button>
      </form>
      {message && <div className="message error">{message}</div>}
      {result && (
        <div className="result-card">
          <h2>Diagnosis</h2>
          <p>{result.diagnosis}</p>
          <h3>Advice</h3>
          <p>{result.advice}</p>
          {result.source && <p className="meta">Source: {result.source}</p>}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
