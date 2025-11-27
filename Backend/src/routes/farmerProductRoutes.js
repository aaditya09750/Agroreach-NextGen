const express = require('express');
const router = express.Router();
const { farmerAuth } = require('../middleware/farmerAuth');
const farmerProductController = require('../controllers/farmerProductController');

// All routes require farmer authentication
router.use(farmerAuth);

// Get all my products
router.get('/', farmerProductController.getMyProducts);

// Get product statistics
router.get('/stats', farmerProductController.getProductStats);

// Get audit data
router.get('/audit', farmerProductController.getAuditData);

// Update product
router.put('/:id', farmerProductController.updateProduct);

// Delete product
router.delete('/:id', farmerProductController.deleteProduct);

module.exports = router;
