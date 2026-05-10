import { useEffect, useState } from 'react';
import { apiGet, apiGetBlob, apiPost, apiPatch } from '../api/api';
import { getToken } from '../utils/auth';
import { Plus, Download, IndianRupee, AlertCircle, Edit2, X } from 'lucide-react';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', amount: '', description: '', paymentMethod: 'Cash' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      try {
        const [bills, pts] = await Promise.all([
          apiGet('/billing', token),
          apiGet('/patients', token),
        ]);
        setInvoices(Array.isArray(bills) ? bills : []);
        setPatients(Array.isArray(pts) ? pts : []);
      } catch { setMessage({ text: 'Failed to load billing.', type: 'error' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (inv) => {
    setEditingId(inv._id);
    setForm({
      patientId: inv.patientId?._id || '',
      amount: inv.amount || '',
      description: inv.description || '',
      paymentMethod: inv.paymentMethod || 'Cash'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ patientId: '', amount: '', description: '', paymentMethod: 'Cash' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const token = getToken();
      if (editingId) {
        const updated = await apiPatch(`/billing/${editingId}`, form, token);
        if (updated._id) {
          // Re-populate patient info for display since API might only return ID
          const updatedWithPatient = { ...updated, patientId: patients.find(p => p._id === updated.patientId) || updated.patientId };
          setInvoices(invoices.map(i => i._id === editingId ? updatedWithPatient : i));
          setMessage({ text: 'Invoice updated successfully.', type: 'success' });
          cancelEdit();
        } else {
          setMessage({ text: updated.message || 'Failed to update invoice.', type: 'error' });
        }
      } else {
        const result = await apiPost('/billing', form, token);
        if (result._id) {
          // Re-populate patient info for display
          const resultWithPatient = { ...result, patientId: patients.find(p => p._id === result.patientId) || result.patientId };
          setInvoices([resultWithPatient, ...invoices]);
          setMessage({ text: 'Invoice created.', type: 'success' });
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
      const updated = await apiPatch(`/billing/${id}`, { status }, token);
      setInvoices(prev => prev.map(i => i._id === id ? { ...updated, patientId: prev.find(p => p._id === id).patientId } : i));
    } catch { setMessage({ text: 'Failed to update status.', type: 'error' }); }
  };

  const downloadPdf = async (id) => {
    try {
      const token = getToken();
      const blob = await apiGetBlob(`/billing/${id}/pdf`, token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { setMessage({ text: 'Failed to download PDF.', type: 'error' }); }
  };

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <>
      <div className="page-header">
        <h1>Billing & Invoices</h1>
        <p>Create invoices, track payments, and download PDFs.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon green"><IndianRupee size={22} /></div></div>
          <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Total Revenue (Paid)</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-card-icon red"><AlertCircle size={22} /></div></div>
          <div className="stat-value">{invoices.filter(i => i.status === 'Pending').length}</div>
          <div className="stat-label">Pending Invoices</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`} onClick={() => showForm ? cancelEdit() : setShowForm(true)}>
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> New Invoice</>}
        </button>
      </div>

      {message.text && <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>{message.text}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', border: editingId ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Invoice' : 'Create Invoice'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Patient</label>
                <div className="input-wrapper">
                  <select name="patientId" value={form.patientId} onChange={handleChange} required>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} (ID: {p._id.slice(-6).toUpperCase()})</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Amount (₹)</label>
                <div className="input-wrapper"><IndianRupee size={18} /><input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="0" required /></div>
              </div>
            </div>
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Description</label>
                <div className="input-wrapper"><input name="description" value={form.description} onChange={handleChange} placeholder="Consultation fee, tests..." /></div>
              </div>
              <div className="input-group">
                <label>Payment Method</label>
                <div className="input-wrapper">
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                    <option>Cash</option><option>Credit Card</option><option>Debit Card</option><option>Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Invoice' : 'Create Invoice'}</button>
              {editingId && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel Edit</button>}
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h2>Invoice History ({invoices.length})</h2></div>
        {loading ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }}></div>)}</div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <IndianRupee size={48} />
            <h3>No invoices yet</h3>
            <p>Create your first invoice above.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Patient</th><th>Amount</th><th>Description</th><th>Status</th><th>Method</th><th>Action</th></tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td><span className="badge badge-info" style={{ fontFamily: 'monospace' }}>{inv.patientId?._id ? inv.patientId._id.slice(-6).toUpperCase() : 'N/A'}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-0)' }}>{inv.patientId?.name || '—'}</td>
                    <td>₹{Number(inv.amount)?.toLocaleString()}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.description || '—'}</td>
                    <td>
                      <select className="inline-select" value={inv.status} onChange={(e) => handleStatus(inv._id, e.target.value)}>
                        <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{inv.paymentMethod || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(inv)} title="Edit Invoice"><Edit2 size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => downloadPdf(inv._id)} title="Download PDF"><Download size={14} /> PDF</button>
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

export default Billing;
