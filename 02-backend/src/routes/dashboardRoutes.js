const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Define routes
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/stats', dashboardController.getPaymentStats);
router.get('/list', dashboardController.getFixedExpenseList);
router.post('/status', dashboardController.togglePaymentStatus);

module.exports = router;
