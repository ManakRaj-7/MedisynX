const express = require('express');
const {
  getPrescriptions,
  createPrescription,
  getPrescriptionPdf
} = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

router.route('/:id/pdf')
  .get(getPrescriptionPdf);

module.exports = router;
