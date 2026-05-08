import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { Link } from 'react-router-dom';
import { Users, Calendar, CreditCard, Stethoscope, ArrowRight } from 'lucide-react';

const GuestDemo = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/demo/data').then(setData).catch(() => setError('Unable to load demo data.'));
  }, []);

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="auth-logo" style={{ marginBottom: '1rem' }}>
            <div className="logo-dot"></div>
            <span>MedisynX</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Guest Demo Mode</h1>
          <p style={{ color: 'var(--text-2)' }}>Explore MedisynX capabilities with sample data.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {data ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="stat-card-icon violet"><Stethoscope size={20} /></div>
                <h3>Doctor</h3>
              </div>
              <p style={{ color: 'var(--text-1)', fontWeight: 600 }}>{data.doctor.name}</p>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{data.doctor.specialization}</p>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{data.doctor.email}</p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="stat-card-icon cyan"><Users size={20} /></div>
                <h3>Patients ({data.patients.length})</h3>
              </div>
              {data.patients.map(p => (
                <div key={p.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: 'var(--text-2)', marginLeft: '0.5rem' }}>Age {p.age}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="stat-card-icon green"><Calendar size={20} /></div>
                <h3>Appointments</h3>
              </div>
              {data.appointments.map(a => (
                <div key={a.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{a.patientName}</span>
                  <br />
                  <span style={{ color: 'var(--text-2)' }}>{new Date(a.date).toLocaleDateString()}</span>
                  <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>{a.status}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="stat-card-icon red"><CreditCard size={20} /></div>
                <h3>Billing</h3>
              </div>
              {data.billing.map(b => (
                <div key={b.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{b.patientName}</span>
                  <span style={{ fontWeight: 600 }}>₹{b.amount}</span>
                </div>
              ))}
            </div>
          </div>
        ) : !error && <p style={{ textAlign: 'center', color: 'var(--text-2)' }}>Loading demo data...</p>}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/login" className="btn btn-primary">
            <ArrowRight size={18} /> Sign In to Full Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestDemo;
