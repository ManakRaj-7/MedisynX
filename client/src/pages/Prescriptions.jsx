import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiGetBlob } from '../api/api';
import { getToken } from '../utils/auth';
import { Pill, PlusCircle, Printer, AlertCircle, CheckCircle, Download } from 'lucide-react';

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
    
    // API call to save in database
    const token = getToken();
    apiPost('/prescriptions', {
      patientId: formData.patientId,
      medication: formData.medication,
      notes: formData.notes
    }, token).then(newRx => {
      if (!newRx._id) {
        throw new Error(newRx.message || 'Server returned invalid response');
      }
      // Create local representation for instant UI update
      const rxWithDate = {
        _id: newRx._id,
        patientId: newRx.patientId,
        patientName: newRx.patientName,
        medication: newRx.medication,
        notes: newRx.notes,
        createdAt: newRx.createdAt
      };
      
      setActivePrescriptions([rxWithDate, ...activePrescriptions]);
      setMessage({ type: 'success', text: 'Prescription signed and saved successfully!' });
      setFormData({ patientId: '', medication: '', notes: '' });
      setTimeout(() => setMessage(null), 3000);
    }).catch(err => {
      setMessage({ type: 'error', text: 'Failed to save. Did you restart your backend server?' });
      setTimeout(() => setMessage(null), 5000);
    });
  };

  const downloadPdf = async (id) => {
    try {
      const token = getToken();
      const blob = await apiGetBlob(`/prescriptions/${id}/pdf`, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rx-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { setMessage({ type: 'error', text: 'Failed to download PDF.' }); setTimeout(() => setMessage(null), 3000); }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken();
        const pts = await apiGet('/patients', token);
        const rxs = await apiGet('/prescriptions', token);
        setPatients(Array.isArray(pts) ? pts : []);
        setActivePrescriptions(Array.isArray(rxs) ? rxs : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const groupedPrescriptions = activePrescriptions.reduce((acc, rx) => {
    const key = rx.patientId || rx.patientName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rx);
    return acc;
  }, {});

  return (
    <>
      <div className="page-header no-print">
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

      <div className="layout-2col no-print">
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
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {Object.entries(groupedPrescriptions).map(([key, rxs]) => (
                <div key={key} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg-2)', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{rxs[0].patientName} <span className="badge badge-info" style={{ marginLeft: '0.5rem', fontFamily: 'monospace' }}>ID: {String(rxs[0].patientId || key).slice(-6).toUpperCase()}</span></h4>
                    <span className="badge badge-outline">{rxs.length} Prescription{rxs.length > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
                    {rxs.map(rx => (
                      <div key={rx._id || Math.random()} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-0)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📅 {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Just now'}
                          </span>
                          {rx._id && (
                            <button className="btn btn-ghost btn-sm" onClick={() => downloadPdf(rx._id)} title="Download PDF" style={{ padding: '0.3rem 0.6rem' }}>
                              <Download size={14} /> Download PDF
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>💊 {rx.medication}</p>
                        {rx.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', margin: 0 }}>📝 {rx.notes}</p>}
                      </div>
                    ))}
                  </div>
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
                    <option key={p._id} value={p._id}>{p.name} (ID: {p._id.slice(-6).toUpperCase()})</option>
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

      {/* Professional PDF Print Template */}
      <div className="print-only card" style={{ padding: '3rem', border: 'none', background: '#fff' }}>
         <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
            <h1 style={{ margin: 0, color: '#000', fontSize: '2rem' }}>MedisynX Clinic</h1>
            <p style={{ margin: 0, color: '#444', fontSize: '1.1rem' }}>Official Electronic Prescription</p>
         </div>
         
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', fontSize: '1.2rem' }}>
            <div>
               <strong style={{ color: '#000' }}>Patient Name:</strong> {patients.find(p => p._id === formData.patientId)?.name || '___________________________'}
            </div>
            <div>
               <strong style={{ color: '#000' }}>Date:</strong> {new Date().toLocaleDateString()}
            </div>
         </div>
         
         <div style={{ minHeight: '400px' }}>
            <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', color: '#000' }}>Rx / Medication</h2>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.3rem', marginTop: '1.5rem', color: '#000', lineHeight: 1.6 }}>
               {formData.medication || '________________________________________________\n\n________________________________________________'}
            </p>
            
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginTop: '3rem', color: '#000' }}>Additional Notes</h3>
            <p style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#000', fontSize: '1.1rem' }}>
               {formData.notes || 'None'}
            </p>
         </div>
         
         <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
               <p style={{ borderBottom: '1px solid #000', width: '250px', margin: '0 0 0.5rem 0' }}></p>
               <p style={{ margin: 0, color: '#000', fontSize: '1.1rem' }}>Doctor's Signature</p>
            </div>
         </div>
      </div>
    </>
  );
};

export default Prescriptions;
