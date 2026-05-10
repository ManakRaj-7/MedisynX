import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch } from '../api/api';
import { getToken, getUser } from '../utils/auth';
import { CalendarPlus, Clock, Edit2, X, Calendar } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', appointmentDate: '', symptoms: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      try {
        const [appts, pts] = await Promise.all([
          apiGet('/appointments', token),
          apiGet('/patients', token),
        ]);
        setAppointments(Array.isArray(appts) ? appts : []);
        setPatients(Array.isArray(pts) ? pts : []);
      } catch { setMessage({ text: 'Failed to load data.', type: 'error' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (a) => {
    setEditingId(a._id);
    // Convert date for datetime-local input
    const date = new Date(a.appointmentDate);
    const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    setForm({
      patientId: a.patientId?._id || '',
      appointmentDate: formattedDate,
      symptoms: a.symptoms || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ patientId: '', appointmentDate: '', symptoms: '' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const token = getToken();
      if (editingId) {
        const updated = await apiPatch(`/appointments/${editingId}`, form, token);
        if (updated._id) {
          // Re-populate patient info for display
          const updatedWithPatient = { ...updated, patientId: patients.find(p => p._id === updated.patientId) || updated.patientId };
          setAppointments(appointments.map(a => a._id === editingId ? updatedWithPatient : a));
          setMessage({ text: 'Appointment updated.', type: 'success' });
          cancelEdit();
        } else {
          setMessage({ text: updated.message || 'Update failed.', type: 'error' });
        }
      } else {
        const payload = { ...form };
        const result = await apiPost('/appointments', payload, token);
        if (result._id) {
          const resultWithPatient = { ...result, patientId: patients.find(p => p._id === result.patientId) || result.patientId };
          setAppointments([resultWithPatient, ...appointments]);
          setMessage({ text: 'Appointment scheduled.', type: 'success' });
          cancelEdit();
        } else {
          setMessage({ text: result.message || 'Failed.', type: 'error' });
        }
      }
    } catch { setMessage({ text: 'Operation failed.', type: 'error' }); }
  };

  const handleStatus = async (id, status) => {
    try {
      const token = getToken();
      const updated = await apiPatch(`/appointments/${id}`, { status }, token);
      setAppointments(prev => prev.map(a => a._id === id ? { ...updated, patientId: prev.find(ap => ap._id === id).patientId } : a));
    } catch { setMessage({ text: 'Failed to update status.', type: 'error' }); }
  };

  const statusBadge = (s) => {
    if (s === 'Completed') return 'badge-success';
    if (s === 'Cancelled') return 'badge-danger';
    return 'badge-warning';
  };

  return (
    <>
      <div className="page-header">
        <h1>Appointments</h1>
        <p>Schedule and manage patient visits.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`} onClick={() => showForm ? cancelEdit() : setShowForm(true)}>
          {showForm ? <><X size={18} /> Cancel</> : <><CalendarPlus size={18} /> New Appointment</>}
        </button>
      </div>

      {message.text && <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>{message.text}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', border: editingId ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Appointment' : 'Schedule Appointment'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Patient</label>
                <div className="input-wrapper">
                  <select name="patientId" value={form.patientId} onChange={handleChange} required>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Date & Time</label>
                <div className="input-wrapper">
                  <Clock size={18} />
                  <input name="appointmentDate" type="datetime-local" value={form.appointmentDate} onChange={handleChange} required />
                </div>
              </div>
            </div>
            <div className="input-group">
              <label>Symptoms (optional)</label>
              <div className="input-wrapper"><textarea name="symptoms" value={form.symptoms} onChange={handleChange} placeholder="Describe symptoms..." /></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Appointment' : 'Schedule'}</button>
              {editingId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel Edit</button>}
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h2>All Appointments ({appointments.length})</h2></div>
        {loading ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }}></div>)}</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No appointments yet</h3>
            <p>Schedule your first appointment above.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Date</th><th>Symptoms</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-0)' }}>{a.patientId?.name || '—'}</td>
                    <td>{new Date(a.appointmentDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.symptoms || '—'}</td>
                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select className="inline-select" value={a.status} onChange={(e) => handleStatus(a._id, e.target.value)}>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(a)} title="Edit Appointment"><Edit2 size={14} /></button>
                      </div>
                    </td>
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

export default Appointments;
