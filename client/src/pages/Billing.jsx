import { useEffect, useState } from 'react';
import { apiGet, apiGetBlob, apiPost, apiPatch } from '../api/api';
import { getToken } from '../utils/auth';
import { Plus, Download, IndianRupee, AlertCircle } from 'lucide-react';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', amount: '', description: '', paymentMethod: 'Cash' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const token = getToken();
      const result = await apiPost('/billing', form, token);
      if (result._id) {
        setInvoices([result, ...invoices]);
        setForm({ patientId: '', amount: '', description: '', paymentMethod: 'Cash' });
        setShowForm(false);
        setMessage({ text: 'Invoice created.', type: 'success' });
      } else {
        setMessage({ text: result.message || 'Failed.', type: 'error' });
      }
    } catch { setMessage({ text: 'Failed to create invoice.', type: 'error' }); }
  };

  const handleStatus = async (id, status) => {
    try {
      const token = getToken();
      const updated = await apiPatch(`/billing/${id}`, { status }, token);
      setInvoices(prev => prev.map(i => i._id === id ? updated : i));
    } catch { setMessage({ text: 'Failed to update.', type: 'error' }); }
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

  const statusBadge = (s) => {
    if (s === 'Paid') return 'badge-success';
    if (s === 'Cancelled') return 'badge-danger';
    return 'badge-warning';
  };

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.amount || 0), 0);

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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Invoice'}
        </button>
      </div>

      {message.text && <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>{message.text}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Create Invoice</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="layout-2col-equal">
              <div className="input-group">
                <label>Patient</label>
                <div className="input-wrapper">
                  <select name="patientId" value={form.patientId} onChange={handleChange} required>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
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
            <button type="submit" className="btn btn-primary">Create Invoice</button>
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
              <thead><tr><th>Patient</th><th>Amount</th><th>Description</th><th>Status</th><th>Method</th><th>PDF</th></tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-0)' }}>{inv.patientId?.name || '—'}</td>
                    <td>₹{inv.amount?.toLocaleString()}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.description || '—'}</td>
                    <td>
                      <select className="inline-select" value={inv.status} onChange={(e) => handleStatus(inv._id, e.target.value)}>
                        <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{inv.paymentMethod || '—'}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => downloadPdf(inv._id)}><Download size={14} /> PDF</button></td>
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
