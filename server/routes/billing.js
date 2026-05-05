const express = require('express');
const { createBilling, getBillings } = require('../controllers/billingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createBilling);
router.get('/', getBillings);

module.exports = router;
