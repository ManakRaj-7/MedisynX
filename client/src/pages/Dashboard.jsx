import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { getToken } from '../utils/auth';
import { 
  Users, 
  CalendarCheck, 
  AlertCircle, 
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, pendingBills: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = getToken();
        const patients = await apiGet('/patients', token);
        const appointments = await apiGet('/appointments', token);
        const billings = await apiGet('/billing', token);
        setStats({
          patients: patients.length || 0,
          appointments: appointments.length || 0,
          pendingBills: billings.filter((invoice) => invoice.status === 'Pending').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Clinical Insights</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back, Dr. Smith. Here is your practice overview for today.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="stat-card" style={{ height: '140px', width: '100%', animate: 'pulse 2s infinite' }}></div>
          ))}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Users className="primary-icon" size={24} color="var(--primary)" />
                <span className="badge success"><TrendingUp size={12} /> +12%</span>
              </div>
              <span className="stat-value">{stats.patients}</span>
              <span className="stat-label">Total Patients</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <CalendarCheck size={24} color="var(--secondary)" />
                <ArrowUpRight size={16} color="var(--text-muted)" />
              </div>
              <span className="stat-value">{stats.appointments}</span>
              <span className="stat-label">Today's Appointments</span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <AlertCircle size={24} color="#ef4444" />
                <span className="badge danger">Urgent</span>
              </div>
              <span className="stat-value">{stats.pendingBills}</span>
              <span className="stat-label">Pending Clearances</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div className="page-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Patient Activity</h2>
                <button className="btn secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>View All</button>
              </div>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <Activity size={48} color="var(--glass-border)" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Activity graph will appear here as data populates.</p>
                </div>
              </div>
            </div>

            <div className="page-card" style={{ background: 'linear-gradient(135deg, rgba(142, 45, 226, 0.1), rgba(74, 0, 224, 0.1))' }}>
              <h3>Quick Actions</h3>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn primary" style={{ width: '100%' }}>New Diagnosis</button>
                <button className="btn secondary" style={{ width: '100%' }}>Schedule Appointment</button>
                <button className="btn secondary" style={{ width: '100%' }}>Register Patient</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
