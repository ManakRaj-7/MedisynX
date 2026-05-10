import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { getToken } from '../utils/auth';
import { Pill, PlusCircle, Printer, AlertCircle, CheckCircle } from 'lucide-react';

const Prescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ patientId: '', medication: '', notes: '' });
  const [message, setMessage] = useState(null);
  const [activePrescriptions, setActivePrescriptions] = useState([]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.medication) {
      setMessage({ type: 'error', text: 'Patient and Medication are required.' });
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      const patient = patients.find(p => p._id === formData.patientId);
      const newRx = {
        id: Date.now(),
        patientName: patient?.name || 'Unknown',
        medication: formData.medication,
        notes: formData.notes,
        date: new Date().toLocaleDateString()
      };
      
      setActivePrescriptions([newRx, ...activePrescriptions]);
      setMessage({ type: 'success', text: 'Prescription signed and saved successfully!' });
      setFormData({ patientId: '', medication: '', notes: '' });
      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken();
        const pts = await apiGet('/patients', token);
        setPatients(Array.isArray(pts) ? pts : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="stat-card-icon blue" style={{ width: 48, height: 48 }}><Pill size={28} /></div>
          <div>
            <h1 style={{ marginBottom: 0 }}>E-Prescriptions</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 2 }}>Manage and issue digital prescriptions.</p>
          </div>
        </div>
        <button className="btn btn-primary">
          <PlusCircle size={18} /> New Prescription
        </button>
      </div>

      <div className="layout-2col">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Active Prescriptions</h3>
          {loading ? (
             <div className="skeleton" style={{ height: 200, borderRadius: 12 }}></div>
          ) : activePrescriptions.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200, padding: '2rem' }}>
               <AlertCircle size={32} />
               <h4>No active prescriptions</h4>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>Select a patient to generate a new prescription.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {activePrescriptions.map(rx => (
                <div key={rx.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{rx.patientName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{rx.date}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>💊 {rx.medication}</p>
                  {rx.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', margin: 0 }}>📝 {rx.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Quick Rx Generator</h3>
          
          {message && (
            <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <form className="form-grid" onSubmit={handleSave}>
            <div className="input-group">
              <label>Select Patient</label>
              <div className="input-wrapper">
                <select 
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  required
                >
                  <option value="" disabled>Choose a patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="input-group">
              <label>Medication (with dosage & frequency)</label>
              <div className="input-wrapper">
                <textarea 
                  value={formData.medication}
                  onChange={e => setFormData({...formData, medication: e.target.value})}
                  placeholder="e.g., Amoxicillin 500mg, 1 tablet 3 times a day for 5 days..." 
                  style={{ minHeight: 120 }} 
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Additional Notes</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Take after meals..." 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save & Sign Rx</button>
               <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => window.print()}><Printer size={18} /> Print PDF</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Prescriptions;
