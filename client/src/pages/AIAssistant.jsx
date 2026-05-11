import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiPost } from '../api/api';
import { getToken } from '../utils/auth';
import { Bot, Sparkles, AlertCircle, Info, Clock, Zap } from 'lucide-react';

const ConfidenceMeter = ({ value }) => {
  const color = value >= 75 ? 'var(--success)' : value >= 50 ? 'var(--warning)' : 'var(--danger)';
  const label = value >= 75 ? 'High Confidence' : value >= 50 ? 'Moderate' : 'Low Confidence';
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Confidence</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{value}% — {label}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
      </div>
    </div>
  );
};

const AIAssistant = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [history, setHistory] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    const start = Date.now();
    try {
      const token = getToken();
      const response = await apiPost('/ai/diagnose', { symptoms, age, gender, history }, token);
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
      setResult(response);
    } catch (err) {
      setError(err.message || 'AI service unavailable. Please try again.');
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
            <h1 style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Clinical AI <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>AI Powered</span>
            </h1>
            <p style={{ color: 'var(--text-2)', marginTop: 2 }}>Powered by MedisynX AI Engine — Structured diagnosis with confidence scoring</p>
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
                <textarea placeholder="e.g. persistent dry cough, fever 101°F for 3 days, fatigue, body aches..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required style={{ minHeight: 100 }} />
              </div>
            </div>
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Age</label>
                <div className="input-wrapper"><input type="number" placeholder="Years" value={age} onChange={(e) => setAge(e.target.value)} /></div>
              </div>
              <div className="input-group">
                <label>Biological Sex</label>
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
                <textarea placeholder="Known allergies, chronic conditions, current medications..." value={history} onChange={(e) => setHistory(e.target.value)} style={{ minHeight: 60 }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Analyzing with AI...' : <><Sparkles size={18} /> Generate Clinical Insight</>}
            </button>
          </form>
          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}><AlertCircle size={16} /> {error}</div>}
        </div>

        <div>
          {!result && !loading && (
            <div className="card empty-state" style={{ minHeight: 400, border: '1px dashed var(--border)' }}>
              <Bot size={56} />
              <h3>Ready for Analysis</h3>
              <p>Enter patient symptoms to generate AI-powered clinical insights with confidence scoring.</p>
            </div>
          )}

          {loading && (
            <div className="card" style={{ minHeight: 400 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 24, color: 'var(--primary)' }}>
                <Zap size={18} /> <span style={{ fontWeight: 600 }}>Processing Clinical AI...</span>
              </div>
              <div className="skeleton" style={{ height: 8, width: '60%', marginBottom: 24 }}></div>
              <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 16 }}></div>
              <div className="skeleton" style={{ height: 120, marginBottom: 16 }}></div>
              <div className="skeleton" style={{ height: 80, width: '90%', marginBottom: 16 }}></div>
              <div className="skeleton" style={{ height: 60, width: '70%' }}></div>
            </div>
          )}

          {result && (
            <div className="card ai-result">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge badge-success">✓ Analysis Complete</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {result.cached && <span className="badge badge-info">Cached</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {elapsed}s
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{result.source}</span>
                </div>
              </div>

              {result.confidence != null && <ConfidenceMeter value={result.confidence} />}

              <ReactMarkdown>{result.content || result.diagnosis || 'No content returned.'}</ReactMarkdown>

              {result.disclaimer && (
                <div className="ai-disclaimer">
                  <div className="ai-disclaimer-label"><Info size={14} /> Clinical Disclaimer</div>
                  <p>{result.disclaimer}</p>
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
