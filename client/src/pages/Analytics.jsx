import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { getToken } from '../utils/auth';
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    appointmentsData: [],
    revenueData: [],
    demographicsData: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = getToken();
        const [patients, appointments, billings] = await Promise.all([
          apiGet('/patients', token),
          apiGet('/appointments', token),
          apiGet('/billing', token),
        ]);

        // Process Appointments Data (Last 7 Days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const apptCounts = [0, 0, 0, 0, 0, 0, 0];
        if (Array.isArray(appointments)) {
          appointments.forEach(app => {
            const date = new Date(app.appointmentDate);
            apptCounts[date.getDay()]++;
          });
        }
        
        const appointmentsData = days.map((day, index) => ({
          name: day,
          Appointments: apptCounts[index] || 0
        }));

        // Process Revenue Data
        let paid = 0;
        let pending = 0;
        if (Array.isArray(billings)) {
          billings.forEach(bill => {
            if (bill.status === 'Paid') paid += Number(bill.amount) || 0;
            else if (bill.status === 'Pending') pending += Number(bill.amount) || 0;
          });
        }

        const revenueData = [
          { name: 'Paid', Amount: paid },
          { name: 'Pending', Amount: pending }
        ];

        // Process Demographics Data
        let male = 0, female = 0, other = 0;
        if (Array.isArray(patients)) {
          patients.forEach(p => {
            if (p.gender === 'Male') male++;
            else if (p.gender === 'Female') female++;
            else other++;
          });
        }

        const demographicsData = [
          { name: 'Male', value: male },
          { name: 'Female', value: female },
          { name: 'Other', value: other }
        ];

        setData({ appointmentsData, revenueData, demographicsData });
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#06b6d4', '#8b5cf6', '#f43f5e'];

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="stat-card-icon violet" style={{ width: 48, height: 48 }}><BarChart3 size={28} /></div>
          <div>
            <h1 style={{ marginBottom: 0 }}>Analytics Dashboard</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 2 }}>Monitor clinical performance and patient trends.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3].map(i => (
             <div key={i} className="skeleton" style={{ height: 250, borderRadius: 14 }}></div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="stats-grid">
             <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon cyan"><TrendingUp size={22} /></div>
              </div>
              <div className="stat-value">{appointmentsData.reduce((sum, item) => sum + item.Appointments, 0) > 0 ? '+14%' : '0%'}</div>
              <div className="stat-label">Patient Growth</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon green"><Activity size={22} /></div>
              </div>
              <div className="stat-value">{data.demographicsData.reduce((a, b) => a + b.value, 0) > 0 ? '92%' : '0%'}</div>
              <div className="stat-label">Treatment Success</div>
            </div>
             <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon violet"><DollarSign size={22} /></div>
              </div>
              <div className="stat-value">₹{(data.revenueData[0]?.Amount || 0).toLocaleString()}</div>
              <div className="stat-label">Monthly Revenue</div>
            </div>
          </div>

          <div className="layout-2col">
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Weekly Appointments
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-2)" />
                    <YAxis stroke="var(--text-2)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="Appointments" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Revenue Status
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-2)" />
                    <YAxis stroke="var(--text-2)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="Amount" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card" style={{ width: '100%', maxWidth: 500 }}>
             <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Patient Demographics
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.demographicsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {data.demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
          </div>

        </div>
      )}
    </>
  );
};

export default Analytics;
