import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { getToken } from '../utils/auth';
import { FileText, Search, FolderOpen, Download, Clock } from 'lucide-react';

const MedicalRecords = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
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

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

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
            <div key={p._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {p.name} <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>ID: {p._id.slice(-6).toUpperCase()}</span>
                </h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-2)', fontSize: '0.85rem' }}>
                  <span>{p.age} yrs • {p.gender}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Last updated: {new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm">View Details</button>
                <button className="btn btn-ghost btn-sm" title="Download Record"><Download size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MedicalRecords;
