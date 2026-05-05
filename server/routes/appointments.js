const express = require('express');
const { createAppointment, getAppointments } = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createAppointment);
router.get('/', getAppointments);

module.exports = router;
