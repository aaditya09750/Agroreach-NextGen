const express = require('express');
const router = express.Router();
const adminProductRequestController = require('../controllers/adminProductRequestController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Get statistics
router.get('/stats', adminProductRequestController.getStats);

// Get all requests with filters
router.get('/', adminProductRequestController.getAllRequests);

// Get single request
router.get('/:id', adminProductRequestController.getRequestById);

// Accept request
router.put('/:id/accept', adminProductRequestController.acceptRequest);

// Reject request
router.put('/:id/reject', adminProductRequestController.rejectRequest);

module.exports = router;
