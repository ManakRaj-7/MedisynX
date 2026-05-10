const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');

// @desc    Get all prescriptions for logged-in doctor
// @route   GET /api/v1/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new prescription
// @route   POST /api/v1/prescriptions
// @access  Private
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medication, notes } = req.body;

    if (!patientId || !medication) {
      return res.status(400).json({ message: 'Patient ID and Medication are required' });
    }

    // Verify patient belongs to doctor
    const patient = await Patient.findOne({ _id: patientId, doctorId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = await Prescription.create({
      doctorId: req.user.id,
      patientId,
      patientName: patient.name,
      medication,
      notes,
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
