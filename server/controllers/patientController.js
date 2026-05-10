const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Billing = require('../models/Billing');
const PDFDocument = require('pdfkit');

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

exports.getPatientHistory = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const patientId = req.params.id;

    const patient = await Patient.findOne({ _id: patientId, doctorId });
    if (!patient) return res.status(404).json({ message: 'Patient not found.' });

    const [appointments, prescriptions, billings] = await Promise.all([
      Appointment.find({ patientId, doctorId }).sort({ appointmentDate: -1 }),
      Prescription.find({ patientId, doctorId }).sort({ createdAt: -1 }),
      Billing.find({ patientId, doctorId }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({ patient, appointments, prescriptions, billings });
  } catch (error) {
    next(error);
  }
};

exports.getPatientRecordPdf = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const patientId = req.params.id;

    const patient = await Patient.findOne({ _id: patientId, doctorId });
    if (!patient) return res.status(404).json({ message: 'Patient not found.' });

    const [appointments, prescriptions, billings] = await Promise.all([
      Appointment.find({ patientId, doctorId }).sort({ appointmentDate: -1 }),
      Prescription.find({ patientId, doctorId }).sort({ createdAt: -1 }),
      Billing.find({ patientId, doctorId }).sort({ createdAt: -1 }),
    ]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="medical-record-${patient._id}.pdf"`);
    doc.pipe(res);

    doc.fillColor('#0284c7').fontSize(24).text('MedisynX Clinic', { align: 'center' });
    doc.fillColor('#64748b').fontSize(12).text('Comprehensive Medical Record (EHR)', { align: 'center' });
    doc.moveDown(2);

    doc.fillColor('#0f172a').fontSize(14).text('Patient Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
       .text(`Name: ${patient.name}`)
       .text(`Patient ID: ${patient._id.toString().slice(-6).toUpperCase()}`)
       .text(`Age/Gender: ${patient.age} yrs / ${patient.gender}`)
       .text(`Contact: ${patient.phone} | ${patient.email || 'N/A'}`);
    doc.moveDown(2);

    doc.fontSize(14).text('Medical History / Prescriptions', { underline: true });
    doc.moveDown(0.5);
    if (prescriptions.length === 0) doc.fontSize(12).fillColor('#64748b').text('No prescriptions found.');
    prescriptions.forEach((rx, i) => {
      doc.fillColor('#0f172a').fontSize(12).text(`${i+1}. ${rx.createdAt.toLocaleDateString()} - ${rx.medication}`);
      if (rx.notes) doc.fillColor('#64748b').fontSize(10).text(`   Notes: ${rx.notes}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(1.5);

    doc.fillColor('#0f172a').fontSize(14).text('Recent Appointments', { underline: true });
    doc.moveDown(0.5);
    if (appointments.length === 0) doc.fontSize(12).fillColor('#64748b').text('No appointments found.');
    appointments.slice(0, 5).forEach((app, i) => {
      doc.fillColor('#0f172a').fontSize(12).text(`• ${app.appointmentDate.toLocaleString('en-IN')} - Status: ${app.status}`);
      if (app.symptoms) doc.fillColor('#64748b').fontSize(10).text(`  Symptoms: ${app.symptoms}`);
      doc.moveDown(0.5);
    });
    doc.moveDown(1.5);

    doc.fillColor('#0f172a').fontSize(14).text('Billing Summary', { underline: true });
    doc.moveDown(0.5);
    const totalPaid = billings.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
    const totalPending = billings.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);
    doc.fontSize(12)
       .text(`Total Paid: Rs. ${totalPaid}`)
       .text(`Total Pending: Rs. ${totalPending}`);
    
    doc.moveDown(3);
    doc.fillColor('#64748b').fontSize(10).text(`Generated by MedisynX on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
    doc.end();
  } catch (error) {
    next(error);
  }
};
