import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiPost } from '../api/api';
import { getToken } from '../utils/auth';
import { Bot, Sparkles, AlertCircle, Info } from 'lucide-react';

const AIAssistant = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [history, setHistory] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const token = getToken();
      const response = await apiPost('/ai/diagnose', { symptoms, age, gender, history }, token);
      setResult(response);
    } catch {
      setError('AI service unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="stat-card-icon cyan" style={{ width: 48, height: 48 }}><Bot size={28} /></div>
          <div>
            <h1 style={{ marginBottom: 0 }}>AI Clinical Assistant</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 2 }}>Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      <div className="layout-2col">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} /> Patient Context
          </h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="input-group">
              <label>Current Symptoms</label>
              <div className="input-wrapper">
                <textarea placeholder="e.g. persistent cough, fever for 3 days..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required />
              </div>
            </div>
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Age</label>
                <div className="input-wrapper"><input type="number" placeholder="Years" value={age} onChange={(e) => setAge(e.target.value)} /></div>
              </div>
              <div className="input-group">
                <label>Gender</label>
                <div className="input-wrapper">
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="input-group">
              <label>Medical History</label>
              <div className="input-wrapper">
                <textarea placeholder="Allergies, prior conditions, medications..." value={history} onChange={(e) => setHistory(e.target.value)} style={{ minHeight: 60 }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Analyzing...' : <><Sparkles size={18} /> Generate Insight</>}
            </button>
          </form>
          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}><AlertCircle size={16} /> {error}</div>}
        </div>

        <div>
          {!result && !loading && (
            <div className="card empty-state" style={{ minHeight: 400, border: '1px dashed var(--border)' }}>
              <Bot size={56} />
              <h3>Ready for Analysis</h3>
              <p>Enter patient symptoms to generate AI-powered clinical insights.</p>
            </div>
          )}

          {loading && (
            <div className="card" style={{ minHeight: 400 }}>
              <div className="skeleton" style={{ height: 24, width: '50%', marginBottom: 24 }}></div>
              <div className="skeleton" style={{ height: 120, marginBottom: 16 }}></div>
              <div className="skeleton" style={{ height: 80, width: '80%' }}></div>
            </div>
          )}

          {result && (
            <div className="card ai-result">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="badge badge-success">Analysis Complete</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Source: {result.source}</span>
              </div>
              <ReactMarkdown>{result.content || result.diagnosis || 'No content returned.'}</ReactMarkdown>
              {(result.disclaimer || result.advice) && (
                <div className="ai-disclaimer">
                  <div className="ai-disclaimer-label"><Info size={14} /> Clinical Disclaimer</div>
                  <p>{result.disclaimer || result.advice}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
