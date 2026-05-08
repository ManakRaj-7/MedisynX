import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiPost } from '../api/api';
import { getToken } from '../utils/auth';
import { Bot, Send, Sparkles, AlertCircle, History, Info } from 'lucide-react';

const AIAssistant = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [history, setHistory] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const token = getToken();
      const response = await apiPost('/ai/diagnose', { symptoms, age, gender, history }, token);
      setResult(response);
    } catch (err) {
      setError('The AI service is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '0.75rem', borderRadius: '12px' }}>
            <Bot size={32} color="var(--primary)" />
          </div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>MedisynX Intelligence</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Advanced clinical decision support powered by Gemini 1.5 Flash.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem', alignItems: 'start' }}>
        <div className="page-card" style={{ margin: 0 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Info size={18} /> Patient Context
          </h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: 'none' }}>
            <label>
              Current Symptoms
              <textarea 
                placeholder="e.g. persistent dry cough, mild fever for 2 days..." 
                value={symptoms} 
                onChange={(e) => setSymptoms(e.target.value)} 
                required 
                style={{ minHeight: '100px' }}
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>
                Age
                <input type="number" placeholder="Years" value={age} onChange={(e) => setAge(e.target.value)} />
              </label>
              <label>
                Gender
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label>
              Relevant History
              <textarea 
                placeholder="Prior conditions, allergies, or recent travel..." 
                value={history} 
                onChange={(e) => setHistory(e.target.value)} 
                style={{ minHeight: '80px' }}
              />
            </label>
            <button type="submit" className="btn primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <>Processing Insights...</>
              ) : (
                <><Sparkles size={18} /> Generate Analysis</>
              )}
            </button>
          </form>
          {error && (
            <div className="message error" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </div>

        <div className="result-area">
          {!result && !loading && (
            <div className="result-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}>
              <div style={{ opacity: 0.3, marginBottom: '1.5rem' }}>
                <Bot size={64} />
              </div>
              <h3 style={{ color: 'var(--text-muted)' }}>Ready for Analysis</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>Provide patient symptoms on the left to generate AI-assisted clinical insights.</p>
            </div>
          )}

          {loading && (
            <div className="result-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ height: '30px', width: '60%', background: 'var(--glass-bg)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ height: '150px', width: '100%', background: 'var(--glass-bg)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ height: '100px', width: '80%', background: 'var(--glass-bg)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
            </div>
          )}

          {result && (
            <div className="result-card" style={{ margin: 0, borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span className="badge success" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary)' }}>Analysis Complete</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source: {result.source}</span>
              </div>
              <div className="ai-result-content">
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Info size={14} /> Clinical Disclaimer
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {result.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
