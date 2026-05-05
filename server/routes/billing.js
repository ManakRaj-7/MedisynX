const express = require('express');
const { createBilling, getBillings, getBillingPdf, updateBilling } = require('../controllers/billingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createBilling);
router.get('/', getBillings);
router.patch('/:id', updateBilling);
router.get('/:id/pdf', getBillingPdf);

module.exports = router;
