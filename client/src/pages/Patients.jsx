import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/api';
import { getToken } from '../utils/auth';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', phone: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const token = getToken();
        const results = await apiGet('/patients', token);
        setPatients(results);
      } catch (err) {
        setMessage('Unable to load patients.');
      }
    };
    loadPatients();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const token = getToken();
      const newPatient = await apiPost('/patients', form, token);
      setPatients([newPatient, ...patients]);
      setForm({ name: '', age: '', gender: 'Male', phone: '', email: '' });
      setMessage('Patient added successfully.');
    } catch (err) {
      setMessage('Unable to create patient.');
    }
  };

  return (
    <div className="page-card">
      <h1>Patient Management</h1>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Age
          <input name="age" type="number" value={form.age} onChange={handleChange} required />
        </label>
        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </label>
        <button type="submit" className="btn primary">Add Patient</button>
      </form>
      {message && <div className="message info">{message}</div>}
      <div className="list-card">
        <h2>Patient List</h2>
        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id || patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Patients;
