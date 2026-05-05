import { useEffect, useState } from 'react';
import { apiGet, apiGetBlob, apiPost, apiPatch } from '../api/api';
import { getToken } from '../utils/auth';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ patientId: '', amount: '', description: '', paymentMethod: 'Cash' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadBillings = async () => {
      try {
        const token = getToken();
        const results = await apiGet('/billing', token);
        setInvoices(results);
      } catch (err) {
        setMessage('Unable to load billing records.');
      }
    };
    loadBillings();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const token = getToken();
      const newBilling = await apiPost('/billing', form, token);
      setInvoices([newBilling, ...invoices]);
      setForm({ patientId: '', amount: '', description: '', paymentMethod: 'Cash' });
      setMessage('Billing record created.');
    } catch (err) {
      setMessage('Unable to create billing record.');
    }
  };

  const handleStatusChange = async (billingId, status) => {
    setMessage('');
    try {
      const token = getToken();
      const updated = await apiPatch(`/billing/${billingId}`, { status }, token);
      setInvoices((prev) => prev.map((item) => (item._id === billingId ? updated : item)));
      setMessage('Billing status updated.');
    } catch (err) {
      setMessage('Unable to update billing status.');
    }
  };

  const downloadInvoice = async (id) => {
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
    } catch (err) {
      setMessage('Unable to download invoice.');
    }
  };

  return (
    <div className="page-card">
      <h1>Billing System</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Patient ID
          <input name="patientId" value={form.patientId} onChange={handleChange} required />
        </label>
        <label>
          Amount
          <input name="amount" type="number" value={form.amount} onChange={handleChange} required />
        </label>
        <label>
          Description
          <input name="description" value={form.description} onChange={handleChange} />
        </label>
        <label>
          Payment Method
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
            <option>Cash</option>
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>Bank Transfer</option>
          </select>
        </label>
        <button type="submit" className="btn primary">Create Bill</button>
      </form>
      {message && <div className="message info">{message}</div>}
      <div className="list-card">
        <h2>Invoices</h2>
        {invoices.length === 0 ? (
          <p>No billing records available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id || invoice.id}>
                  <td>{invoice.patientId?.name || invoice.patientId || '—'}</td>
                  <td>₹{invoice.amount}</td>
                  <td>
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{invoice.paymentMethod || '—'}</td>
                  <td>
                    <button type="button" className="btn secondary" onClick={() => downloadInvoice(invoice._id || invoice.id)}>
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Billing;
