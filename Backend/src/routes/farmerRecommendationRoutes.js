const express = require('express');
const router = express.Router();
const { farmerAuth } = require('../middleware/farmerAuth');
const farmerRecommendationController = require('../controllers/farmerRecommendationController');

// All routes require farmer authentication
router.use(farmerAuth);

// Get all recommendations for farmer
router.get('/', farmerRecommendationController.getRecommendations);

// Get recommendations for specific product
router.get('/product/:productId', farmerRecommendationController.getProductRecommendations);

// Dismiss a recommendation
router.post('/:id/dismiss', farmerRecommendationController.dismissRecommendation);

// Mark recommendation as acted upon
router.post('/:id/acted', farmerRecommendationController.markAsActed);

module.exports = router;
