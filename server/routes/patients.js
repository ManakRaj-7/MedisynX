const express = require('express');
const { createPatient, getPatients, getPatientById } = require('../controllers/patientController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById);

module.exports = router;
