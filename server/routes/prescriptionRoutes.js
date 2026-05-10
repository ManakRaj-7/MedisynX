const express = require('express');
const {
  getPrescriptions,
  createPrescription,
} = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

module.exports = router;
