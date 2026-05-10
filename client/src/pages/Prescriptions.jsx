import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { getToken } from '../utils/auth';
import { Pill, PlusCircle, Printer, AlertCircle } from 'lucide-react';

const Prescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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
          ) : (
            <div className="empty-state" style={{ minHeight: 200, padding: '2rem' }}>
               <AlertCircle size={32} />
               <h4>No active prescriptions</h4>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>Select a patient to generate a new prescription.</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Quick Rx Generator</h3>
          <form className="form-grid">
            <div className="input-group">
              <label>Select Patient</label>
              <div className="input-wrapper">
                <select defaultValue="">
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
                <textarea placeholder="e.g., Amoxicillin 500mg, 1 tablet 3 times a day for 5 days..." style={{ minHeight: 120 }} />
              </div>
            </div>
            
            <div className="input-group">
              <label>Additional Notes</label>
              <div className="input-wrapper">
                <input type="text" placeholder="Take after meals..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <button type="button" className="btn btn-primary" style={{ flex: 1 }}>Save & Sign Rx</button>
               <button type="button" className="btn btn-secondary" style={{ flex: 1 }}><Printer size={18} /> Print PDF</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Prescriptions;
