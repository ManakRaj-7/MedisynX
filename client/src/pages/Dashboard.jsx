import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { getToken } from '../utils/auth';

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
    <div className="page-card">
      <h1>Doctor Dashboard</h1>
      {loading ? (
        <p>Loading statistics...</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Patients</h3>
            <p>{stats.patients}</p>
          </div>
          <div className="stat-card">
            <h3>Appointments</h3>
            <p>{stats.appointments}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Bills</h3>
            <p>{stats.pendingBills}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
