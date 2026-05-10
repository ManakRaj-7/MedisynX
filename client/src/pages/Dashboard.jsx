import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/api';
import { getToken, getUser } from '../utils/auth';
import {
  Users, CalendarCheck, AlertCircle, TrendingUp,
  Activity, Bot, UserPlus, CalendarPlus
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, pendingBills: 0 });
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = getToken();
        const [patients, appointments, billings] = await Promise.all([
          apiGet('/patients', token),
          apiGet('/appointments', token),
          apiGet('/billing', token),
        ]);
        setStats({
          patients: Array.isArray(patients) ? patients.length : 0,
          appointments: Array.isArray(appointments) ? appointments.length : 0,
          pendingBills: Array.isArray(billings) ? billings.filter(b => b.status === 'Pending').length : 0,
        });
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'Doctor'} 👋
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Beta</span>
          </h1>
          <p>Here's your clinical overview for today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-success">HIPAA Ready</span>
          <span className="badge badge-info">Cloud Synced</span>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: 42, width: 42, borderRadius: 14 }}></div>
              <div className="skeleton" style={{ height: 32, width: 60, marginTop: 16 }}></div>
              <div className="skeleton" style={{ height: 14, width: 100, marginTop: 8 }}></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon cyan"><Users size={22} /></div>
                <span className="badge badge-success"><TrendingUp size={10} /> Active</span>
              </div>
              <div className="stat-value">{stats.patients}</div>
              <div className="stat-label">Total Patients</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon violet"><CalendarCheck size={22} /></div>
                <span className="badge badge-info">Today</span>
              </div>
              <div className="stat-value">{stats.appointments}</div>
              <div className="stat-label">Appointments</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon red"><AlertCircle size={22} /></div>
                <span className="badge badge-danger">Pending</span>
              </div>
              <div className="stat-value">{stats.pendingBills}</div>
              <div className="stat-label">Unpaid Bills</div>
            </div>
          </div>

          <div className="layout-2col-equal">
            <div className="card">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <button className="btn btn-primary btn-full" onClick={() => navigate('/ai-assistant')}>
                  <Bot size={18} /> Clinical AI
                </button>
                <button className="btn btn-secondary btn-full" onClick={() => navigate('/patients')}>
                  <UserPlus size={18} /> Add Patient
                </button>
                <button className="btn btn-secondary btn-full" onClick={() => navigate('/appointments')}>
                  <CalendarPlus size={18} /> Schedule Appointment
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>System Status</h2>
                <span className="badge badge-success">Online</span>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>AI Engine</span>
                  <span className="badge badge-success">Gemini 1.5 Flash</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Database</span>
                  <span className="badge badge-success">Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Auth</span>
                  <span className="badge badge-success">JWT Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Your Role</span>
                  <span className="badge badge-info">Doctor</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
