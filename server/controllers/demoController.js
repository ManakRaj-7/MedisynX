exports.getDemoData = (req, res) => {
  const demoData = {
    doctor: {
      id: 'demo-doctor-1',
      name: 'Dr. Maya Singh',
      specialization: 'General Medicine',
      email: 'demo.doctor@medisynx.com',
    },
    patients: [
      {
        id: 'demo-patient-1',
        name: 'Aarav Sharma',
        age: 34,
        gender: 'Male',
        phone: '+91 98765 43210',
        medicalHistory: ['Hypertension', 'Seasonal allergies'],
      },
      {
        id: 'demo-patient-2',
        name: 'Sana Patel',
        age: 29,
        gender: 'Female',
        phone: '+91 91234 56789',
        medicalHistory: ['Migraine'],
      },
    ],
    appointments: [
      {
        id: 'demo-appointment-1',
        patientName: 'Aarav Sharma',
        date: '2026-05-10T10:30:00.000Z',
        status: 'Scheduled',
        diagnosis: 'Routine checkup',
      },
      {
        id: 'demo-appointment-2',
        patientName: 'Sana Patel',
        date: '2026-05-12T14:00:00.000Z',
        status: 'Scheduled',
        diagnosis: 'Migraine follow-up',
      },
    ],
    billing: [
      {
        id: 'demo-bill-1',
        patientName: 'Aarav Sharma',
        amount: 1200,
        status: 'Pending',
        createdAt: '2026-05-08T09:00:00.000Z',
      },
      {
        id: 'demo-bill-2',
        patientName: 'Sana Patel',
        amount: 850,
        status: 'Paid',
        createdAt: '2026-05-06T11:30:00.000Z',
      },
    ],
  };

  res.status(200).json(demoData);
};
