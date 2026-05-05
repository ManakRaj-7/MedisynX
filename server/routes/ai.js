const express = require('express');
const { diagnose } = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.post('/diagnose', diagnose);

module.exports = router;
