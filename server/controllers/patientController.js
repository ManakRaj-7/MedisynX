const Patient = require('../models/Patient');

exports.createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone, email, medicalHistory } = req.body;
    const doctorId = req.user.id;

    if (!name || !age || !gender || !phone) {
      return res.status(400).json({ message: 'Name, age, gender, and phone are required.' });
    }

    // Check for duplicate phone under the SAME doctor only
    const existingPatient = await Patient.findOne({ phone, doctorId });
    if (existingPatient) {
      return res.status(409).json({ message: 'Patient with this phone already exists.' });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      email,
      doctorId,
      medicalHistory: medicalHistory || [],
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { search } = req.query;
    const query = { doctorId };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const patient = await Patient.findOne({ _id: req.params.id, doctorId }).populate('appointments');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const updates = req.body;

    // Don't allow doctorId to be changed
    delete updates.doctorId;

    // Don't allow phone update if it clashes with another patient of the same doctor
    if (updates.phone) {
      const existing = await Patient.findOne({ phone: updates.phone, doctorId, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ message: 'Another patient already has this phone number.' });
      }
    }

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, doctorId },
      updates,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};
