const express = require('express');
const { createAppointment, getAppointments, updateAppointment } = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createAppointment);
router.get('/', getAppointments);
router.patch('/:id', updateAppointment);

module.exports = router;
