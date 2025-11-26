const express = require('express');
const router = express.Router();
const adminFarmerController = require('../controllers/adminFarmerController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

// Apply authentication and admin role check to all routes
router.use(protect);
router.use(adminOnly);

// Get all farmers
router.get('/', adminFarmerController.getAllFarmers);

// Get single farmer
router.get('/:id', adminFarmerController.getFarmerById);

// Get farmer's product requests
router.get('/:id/requests', adminFarmerController.getFarmerRequests);

// Toggle farmer verification
router.put('/:id/toggle-verification', adminFarmerController.toggleVerification);

module.exports = router;
