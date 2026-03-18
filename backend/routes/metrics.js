const express = require('express');
const controller = require('../controllers/metricsController');

const router = express.Router();

router.get('/', controller.getMetrics);

module.exports = router;

