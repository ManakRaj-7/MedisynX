const express = require('express');
const { diagnose, downloadDiagnosisPdf } = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.post('/diagnose', diagnose);
router.post('/diagnose/pdf', downloadDiagnosisPdf);

module.exports = router;
