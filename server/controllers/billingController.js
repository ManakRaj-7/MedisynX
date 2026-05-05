const Billing = require('../models/Billing');

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
