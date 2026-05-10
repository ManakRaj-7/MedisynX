const express = require('express');
const {
  getPrescriptions,
  createPrescription,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

module.exports = router;
