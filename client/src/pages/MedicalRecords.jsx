import { useEffect, useState } from 'react';
import { apiGet, apiGetBlob } from '../api/api';
import { getToken } from '../utils/auth';
import { FileText, Search, FolderOpen, Download, Clock } from 'lucide-react';

const MedicalRecords = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const downloadRecordPdf = async (id, name) => {
    try {
      const token = getToken();
      const blob = await apiGetBlob(`/patients/${id}/pdf`, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EHR_${name.replace(/\\s+/g, '_')}_${id.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { 
      console.error('Failed to download PDF.');
    }
  };

  const toggleDetails = async (id) => {
    if (expandedPatient === id) {
      setExpandedPatient(null);
      setPatientHistory(null);
      return;
    }
    setExpandedPatient(id);
    setHistoryLoading(true);
    try {
      const token = getToken();
      const data = await apiGet(`/patients/${id}/history`, token);
      setPatientHistory(data);
    } catch {
      setPatientHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="stat-card-icon green" style={{ width: 48, height: 48 }}><FileText size={28} /></div>
          <div>
            <h1 style={{ marginBottom: 0 }}>Medical Records</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 2 }}>Secure Electronic Health Records (EHR) & History.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={18} />
          <input placeholder="Search patient records..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }}></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} />
          <h3>No records found</h3>
          <p>Register patients to start managing their medical histories.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map(p => (
            <div key={p._id} style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-1)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-1)' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {p.name} <span className="badge badge-info" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>ID: {p._id.slice(-6).toUpperCase()}</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-2)', fontSize: '0.85rem' }}>
                    <span>{p.age} yrs • {p.gender}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Last updated: {new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleDetails(p._id)}>
                    {expandedPatient === p._id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button className="btn btn-ghost btn-sm" title="Download Complete Record PDF" onClick={() => downloadRecordPdf(p._id, p.name)}>
                    <Download size={16} />
                  </button>
                </div>
              </div>
              
              {expandedPatient === p._id && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                  {historyLoading ? (
                    <div className="skeleton" style={{ height: 100, borderRadius: 8 }}></div>
                  ) : patientHistory ? (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-1)' }}>Past Prescriptions ({patientHistory.prescriptions.length})</h4>
                        {patientHistory.prescriptions.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>No prescriptions found.</p> : (
                          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
                            {patientHistory.prescriptions.map(rx => (
                              <li key={rx._id} style={{ marginBottom: '0.25rem' }}>
                                <strong>{new Date(rx.createdAt).toLocaleDateString()}:</strong> {rx.medication}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-1)' }}>Appointments ({patientHistory.appointments.length})</h4>
                        {patientHistory.appointments.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>No appointments found.</p> : (
                          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
                            {patientHistory.appointments.map(app => (
                              <li key={app._id} style={{ marginBottom: '0.25rem' }}>
                                <strong>{new Date(app.appointmentDate).toLocaleString()}:</strong> {app.status} {app.symptoms ? `- Symptoms: ${app.symptoms}` : ''}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-1)' }}>Billing</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                          Total Paid: Rs. {patientHistory.billings.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0)} | 
                          Total Pending: Rs. {patientHistory.billings.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--danger)' }}>Failed to load patient history.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MedicalRecords;
