const Patient = require('../models/Patient');

exports.createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone, email, medicalHistory } = req.body;

    if (!name || !age || !gender || !phone) {
      return res.status(400).json({ message: 'Name, age, gender, and phone are required.' });
    }

    const existingPatient = await Patient.findOne({ phone });
    if (existingPatient) {
      return res.status(409).json({ message: 'Patient with this phone already exists.' });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      email,
      medicalHistory: medicalHistory || [],
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

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
    const patient = await Patient.findById(req.params.id).populate('appointments');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};
