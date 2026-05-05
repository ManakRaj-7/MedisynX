import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/api';
import { getToken } from '../utils/auth';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentDate: '', symptoms: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const token = getToken();
        const results = await apiGet('/appointments', token);
        setAppointments(results);
      } catch (err) {
        setMessage('Unable to load appointments.');
      }
    };
    loadAppointments();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const token = getToken();
      const newAppointment = await apiPost('/appointments', form, token);
      setAppointments([newAppointment, ...appointments]);
      setForm({ patientId: '', doctorId: '', appointmentDate: '', symptoms: '' });
      setMessage('Appointment created successfully.');
    } catch (err) {
      setMessage('Unable to create appointment.');
    }
  };

  return (
    <div className="page-card">
      <h1>Appointment Manager</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Patient ID
          <input name="patientId" value={form.patientId} onChange={handleChange} required />
        </label>
        <label>
          Doctor ID
          <input name="doctorId" value={form.doctorId} onChange={handleChange} required />
        </label>
        <label>
          Appointment Date
          <input name="appointmentDate" type="datetime-local" value={form.appointmentDate} onChange={handleChange} required />
        </label>
        <label>
          Symptoms
          <textarea name="symptoms" value={form.symptoms} onChange={handleChange} />
        </label>
        <button type="submit" className="btn primary">Schedule</button>
      </form>
      {message && <div className="message info">{message}</div>}
      <div className="list-card">
        <h2>Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id || appointment.id}>
                  <td>{appointment.patientId?.name || appointment.patientId || '—'}</td>
                  <td>{appointment.doctorId?.name || appointment.doctorId || '—'}</td>
                  <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
                  <td>{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Appointments;
