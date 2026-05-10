const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const PDFDocument = require('pdfkit');
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

// @desc    Download prescription as PDF
// @route   GET /api/v1/prescriptions/:id/pdf
// @access  Private
exports.getPrescriptionPdf = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, doctorId: req.user.id });
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rx-${prescription._id}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fillColor('#0284c7').fontSize(24).text('MedisynX Clinic', { align: 'center' });
    doc.fillColor('#64748b').fontSize(12).text('Official Electronic Prescription', { align: 'center' });
    doc.moveDown(2);
    
    // Patient & Date
    doc.fillColor('#0f172a').fontSize(12)
       .text(`Patient: ${prescription.patientName}`, { continued: true })
       .text(`Date: ${prescription.createdAt.toLocaleDateString()}`, { align: 'right' });
    
    doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).strokeColor('#e2e8f0').stroke();
    doc.moveDown(2);

    // Rx
    doc.fillColor('#0f172a').fontSize(14).text('Rx / Medication', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(prescription.medication, { lineGap: 4 });
    doc.moveDown(2);

    if (prescription.notes) {
      doc.fontSize(14).text('Additional Notes', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(prescription.notes, { lineGap: 4 });
    }

    doc.moveDown(4);
    doc.moveTo(400, doc.y).lineTo(550, doc.y).strokeColor('#000').stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).text("Doctor's Signature", 400, doc.y, { align: 'center', width: 150 });

    doc.end();
  } catch (error) {
    next(error);
  }
};
