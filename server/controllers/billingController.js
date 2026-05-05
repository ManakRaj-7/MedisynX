const Billing = require('../models/Billing');
const PDFDocument = require('pdfkit');

exports.createBilling = async (req, res, next) => {
  try {
    const { patientId, appointmentId, amount, description, paymentMethod } = req.body;

    if (!patientId || !amount) {
      return res.status(400).json({ message: 'Patient and amount are required.' });
    }

    const billing = await Billing.create({
      patientId,
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
    const { patientId, status } = req.query;
    const query = {};

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
    const updates = req.body;
    const billing = await Billing.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

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
    const billing = await Billing.findById(req.params.id)
      .populate('patientId', 'name phone email')
      .populate('appointmentId', 'appointmentDate status');

    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${billing._id}.pdf"`);

    doc.pipe(res);

    doc.fontSize(20).text('MedisynX Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice ID: ${billing._id}`);
    doc.text(`Created: ${billing.createdAt.toISOString().slice(0, 10)}`);
    doc.text(`Status: ${billing.status}`);
    doc.moveDown();

    doc.fontSize(14).text('Patient Details', { underline: true });
    doc.fontSize(12).text(`Name: ${billing.patientId?.name || 'Unknown'}`);
    doc.text(`Phone: ${billing.patientId?.phone || 'Unknown'}`);
    doc.text(`Email: ${billing.patientId?.email || 'Unknown'}`);
    doc.moveDown();

    if (billing.appointmentId) {
      doc.fontSize(14).text('Appointment Details', { underline: true });
      doc.fontSize(12).text(`Appointment Date: ${billing.appointmentId.appointmentDate?.toISOString().slice(0, 16).replace('T', ' ') || 'Unknown'}`);
      doc.text(`Appointment Status: ${billing.appointmentId.status || 'Unknown'}`);
      doc.moveDown();
    }

    doc.fontSize(14).text('Billing Details', { underline: true });
    doc.fontSize(12).text(`Amount: ₹${billing.amount}`);
    doc.text(`Payment Method: ${billing.paymentMethod || 'N/A'}`);
    doc.text(`Description: ${billing.description || 'No description provided.'}`);
    doc.moveDown();

    doc.text('Thank you for choosing MedisynX.', { align: 'center' });
    doc.end();
  } catch (error) {
    next(error);
  }
};
