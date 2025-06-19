const express = require('express');
const analyzeController = require('../controllers/analyze.controller');

const router = express.Router();

router.post('/analyze', analyzeController.analyzeCompany);

module.exports = router;