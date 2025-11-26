const express = require('express');
const router = express.Router();
const farmerProductRequestController = require('../controllers/farmerProductRequestController');
const { farmerAuth } = require('../middleware/farmerAuth');
const upload = require('../middleware/upload');

// All routes require farmer authentication
router.use(farmerAuth);

// Create product request with single image
router.post('/', upload.single('initialImage'), farmerProductRequestController.createProductRequest);

// Get my requests
router.get('/', farmerProductRequestController.getMyRequests);

// Get single request
router.get('/:id', farmerProductRequestController.getRequestById);

// Complete product details with multiple images
router.post('/:requestId/complete', upload.array('images', 5), farmerProductRequestController.completeProductDetails);

// Delete pending request
router.delete('/:id', farmerProductRequestController.deleteRequest);

module.exports = router;
