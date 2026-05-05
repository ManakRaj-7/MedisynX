import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';
import { Link } from 'react-router-dom';

const GuestDemo = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDemo = async () => {
      try {
        const demoData = await apiGet('/demo/data');
        setData(demoData);
      } catch (err) {
        setError('Unable to load demo data.');
      }
    };

    loadDemo();
  }, []);

  return (
    <div className="page-card">
      <h1>Guest Demo Mode</h1>
      {error && <div className="message error">{error}</div>}
      {data ? (
        <div className="demo-grid">
          <section>
            <h2>Doctor</h2>
            <p>{data.doctor.name}</p>
            <p>{data.doctor.specialization}</p>
            <p>{data.doctor.email}</p>
          </section>
          <section>
            <h2>Patients</h2>
            <ul>
              {data.patients.map((patient) => (
                <li key={patient.id}>{patient.name} ({patient.age})</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Appointments</h2>
            <ul>
              {data.appointments.map((appointment) => (
                <li key={appointment.id}>{appointment.patientName} - {new Date(appointment.date).toLocaleString()}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Billing</h2>
            <ul>
              {data.billing.map((bill) => (
                <li key={bill.id}>{bill.patientName}: ₹{bill.amount} - {bill.status}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <p>Loading demo data...</p>
      )}
      <Link className="btn secondary" to="/login">
        Back to login
      </Link>
    </div>
  );
};

export default GuestDemo;
