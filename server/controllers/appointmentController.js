const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, symptoms, diagnosis, prescription, notes } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({ message: 'Patient, doctor, and date are required.' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      symptoms,
      diagnosis,
      prescription,
      notes,
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId } = req.query;
    const query = {};

    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name age gender phone')
      .populate('doctorId', 'name specialization email')
      .sort({ appointmentDate: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};
