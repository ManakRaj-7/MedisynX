const Billing = require('../models/Billing');
const PDFDocument = require('pdfkit');

exports.createBilling = async (req, res, next) => {
  try {
    const { patientId, appointmentId, amount, description, paymentMethod } = req.body;
    const doctorId = req.user.id;

    if (!patientId || !amount) {
      return res.status(400).json({ message: 'Patient and amount are required.' });
    }

    const billing = await Billing.create({
      patientId,
      doctorId,
      appointmentId,
      amount,
      description,
      paymentMethod,
      status: 'Pending',
    });

    res.status(201).json(billing);
  } catch (error) {
    next(error);
  }
};

exports.getBillings = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { patientId, status } = req.query;
    const query = { doctorId };

    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const billings = await Billing.find(query)
      .populate('patientId', 'name phone')
      .populate('appointmentId', 'appointmentDate status')
      .sort({ createdAt: -1 });

    res.status(200).json(billings);
  } catch (error) {
    next(error);
  }
};

exports.updateBilling = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const updates = req.body;

    // Don't allow doctorId to be changed
    delete updates.doctorId;

    const billing = await Billing.findOneAndUpdate(
      { _id: req.params.id, doctorId },
      updates,
      { new: true, runValidators: true }
    );

    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found.' });
    }

    res.status(200).json(billing);
  } catch (error) {
    next(error);
  }
};

exports.getBillingPdf = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const billing = await Billing.findOne({ _id: req.params.id, doctorId })
      .populate('patientId', 'name phone email')
      .populate('appointmentId', 'appointmentDate status');

    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${billing._id}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fillColor('#0284c7').fontSize(24).text('MedisynX Invoice', { align: 'center' });
    doc.fillColor('#64748b').fontSize(12).text('Official Billing Receipt', { align: 'center' });
    doc.moveDown(2);

    // Details Row 1
    doc.fillColor('#0f172a').fontSize(12)
       .text(`Invoice ID: ${billing._id}`, { continued: true })
       .text(`Date: ${billing.createdAt.toLocaleDateString()}`, { align: 'right' });
    
    // Details Row 2
    doc.text(`Status: ${billing.status}`, { continued: true })
       .text(`Amount: Rs. ${billing.amount}`, { align: 'right' });

    doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).strokeColor('#e2e8f0').stroke();
    doc.moveDown(2);

    // Sections
    doc.fillColor('#0f172a').fontSize(14).text('Patient Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
       .text(`Name: ${billing.patientId?.name || 'Unknown'}`)
       .text(`Phone: ${billing.patientId?.phone || 'Unknown'}`)
       .text(`Email: ${billing.patientId?.email || 'N/A'}`);
    doc.moveDown(1.5);

    doc.fontSize(14).text('Billing Details', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12)
       .text(`Payment Method: ${billing.paymentMethod || 'N/A'}`)
       .text(`Description: ${billing.description || 'Consultation and Services'}`);
    doc.moveDown(2);

    if (billing.appointmentId) {
      doc.fontSize(14).text('Appointment Reference', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12)
         .text(`Date: ${new Date(billing.appointmentId.appointmentDate).toLocaleString()}`)
         .text(`Status: ${billing.appointmentId.status}`);
      doc.moveDown(2);
    }

    doc.moveDown(2);
    doc.fillColor('#64748b').fontSize(10).text('Thank you for choosing MedisynX Clinic.', { align: 'center' });
    doc.end();
  } catch (error) {
    next(error);
  }
};
