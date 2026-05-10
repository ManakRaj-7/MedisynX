const express = require('express');
const { createPatient, getPatients, getPatientById, updatePatient, getPatientHistory, getPatientRecordPdf } = require('../controllers/patientController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.patch('/:id', updatePatient);
router.get('/:id/history', getPatientHistory);
router.get('/:id/pdf', getPatientRecordPdf);

module.exports = router;
