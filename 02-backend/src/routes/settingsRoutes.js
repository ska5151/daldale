const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Categories
router.get('/categories', settingsController.getCategories);
router.post('/categories', settingsController.createCategory);
router.put('/categories/reorder', settingsController.updateCategoryOrder); // Must be before :id
router.put('/categories/:id', settingsController.updateCategory);
router.delete('/categories/:id', settingsController.deleteCategory);

// Payment Methods
router.get('/payment-methods', settingsController.getPaymentMethods);
router.post('/payment-methods', settingsController.createPaymentMethod);
router.delete('/payment-methods/:id', settingsController.deletePaymentMethod);

// User Profile & Settings
router.get('/user/profile', settingsController.getUserProfile);
router.put('/user/settings', settingsController.updateUserSettings);

module.exports = router;
