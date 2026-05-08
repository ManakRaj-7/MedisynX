import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/api';
import { getToken } from '../utils/auth';
import { UserPlus, Search, User, Phone, Mail } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', phone: '', email: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    try {
      const token = getToken();
      const results = await apiGet('/patients', token);
      setPatients(Array.isArray(results) ? results : []);
    } catch {
      setMessage({ text: 'Failed to load patients.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPatients(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const token = getToken();
      const newPatient = await apiPost('/patients', form, token);
      if (newPatient._id) {
        setPatients([newPatient, ...patients]);
        setForm({ name: '', age: '', gender: 'Male', phone: '', email: '' });
        setShowForm(false);
        setMessage({ text: 'Patient registered successfully.', type: 'success' });
      } else {
        setMessage({ text: newPatient.message || 'Failed to add patient.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to add patient.', type: 'error' });
    }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1>Patient Management</h1>
        <p>Register and manage patient records.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={18} />
          <input placeholder="Search by name, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={18} /> {showForm ? 'Cancel' : 'New Patient'}
        </button>
      </div>

      {message.text && <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>{message.text}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Register New Patient</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrapper"><User size={18} /><input name="name" value={form.name} onChange={handleChange} placeholder="Patient name" required /></div>
              </div>
              <div className="input-group">
                <label>Age</label>
                <div className="input-wrapper"><input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Years" required /></div>
              </div>
            </div>
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Gender</label>
                <div className="input-wrapper">
                  <select name="gender" value={form.gender} onChange={handleChange}><option>Male</option><option>Female</option><option>Other</option></select>
                </div>
              </div>
              <div className="input-group">
                <label>Phone</label>
                <div className="input-wrapper"><Phone size={18} /><input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required /></div>
              </div>
            </div>
            <div className="input-group">
              <label>Email (Optional)</label>
              <div className="input-wrapper"><Mail size={18} /><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="patient@email.com" /></div>
            </div>
            <button type="submit" className="btn btn-primary">Register Patient</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>All Patients ({filtered.length})</h2>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }}></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No patients found</h3>
            <p>Register your first patient to get started.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Email</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-0)' }}>{p.name}</td>
                    <td>{p.age}</td>
                    <td><span className="badge badge-info">{p.gender}</span></td>
                    <td>{p.phone}</td>
                    <td>{p.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Patients;
