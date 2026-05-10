const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, appointmentDate, symptoms, diagnosis, prescription, notes } = req.body;
    const doctorId = req.user.id;

    if (!patientId || !appointmentDate) {
      return res.status(400).json({ message: 'Patient and date are required.' });
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
    const doctorId = req.user.id;
    const { patientId } = req.query;
    const query = { doctorId };

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

exports.updateAppointment = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const updates = req.body;

    // Don't allow doctorId to be changed
    delete updates.doctorId;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId },
      updates,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};
