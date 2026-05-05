const express = require('express');
const { getDemoData } = require('../controllers/demoController');

const router = express.Router();

router.get('/data', getDemoData);

module.exports = router;
