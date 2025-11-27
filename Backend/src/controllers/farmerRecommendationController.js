const Product = require('../models/Product');
const Recommendation = require('../models/Recommendation');
const { analyzeInventory, getActionDetails } = require('../services/productRecommendationService');

// Get all active recommendations for farmer
exports.getRecommendations = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    console.log(`Fetching recommendations for farmer: ${farmerId}`);

    // Fetch farmer's products
    const products = await Product.find({ seller: farmerId }).sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No products found to analyze'
      });
    }

    // Calculate stats
    const totalProducts = products.length;
    const inStock = products.filter(p => p.stockQuantity > 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0).toFixed(2);

    const stats = {
      totalProducts,
      inStock,
      totalValue
    };

    // Generate fresh recommendations
    console.log('Analyzing inventory with stats:', stats);
    console.log('Products to analyze:', products.map(p => ({ 
      name: p.name, 
      stock: p.stockQuantity, 
      category: p.category, 
      age: Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24)) 
    })));
    const recommendationsData = await analyzeInventory(farmerId, products, stats);
    console.log(`Generated ${recommendationsData.length} recommendations`);

    // Delete old recommendations for this farmer
    await Recommendation.deleteMany({ farmerId, status: 'ACTIVE' });

    // Save new recommendations
    const savedRecommendations = [];
    for (const recData of recommendationsData) {
      const recommendation = new Recommendation({
        farmerId,
        productId: recData.productId,
        productName: recData.productName,
        type: recData.type,
        priority: recData.priority,
        title: recData.title,
        message: recData.message,
        actionData: recData.actionData,
        icon: recData.icon,
        color: recData.color,
        status: 'ACTIVE'
      });

      await recommendation.save();
      
      // Add action details
      const actionDetails = getActionDetails(recData);
      savedRecommendations.push({
        ...recommendation.toObject(),
        actionDetails
      });
    }

    console.log(`Generated ${savedRecommendations.length} recommendations for farmer ${farmerId}`);

    res.json({
      success: true,
      recommendations: savedRecommendations,
      stats: {
        total: savedRecommendations.length,
        critical: savedRecommendations.filter(r => r.priority === 'CRITICAL').length,
        high: savedRecommendations.filter(r => r.priority === 'HIGH').length,
        medium: savedRecommendations.filter(r => r.priority === 'MEDIUM').length,
        low: savedRecommendations.filter(r => r.priority === 'LOW').length
      }
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

// Get recommendations for a specific product
exports.getProductRecommendations = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    const { productId } = req.params;

    console.log(`Fetching recommendations for product: ${productId}`);

    // Verify product belongs to farmer
    const product = await Product.findOne({ _id: productId, seller: farmerId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find active recommendations for this product
    const recommendations = await Recommendation.find({
      productId,
      farmerId,
      status: 'ACTIVE'
    }).sort({ priority: 1, createdAt: -1 });

    // Add action details
    const recommendationsWithDetails = recommendations.map(rec => {
      const actionDetails = getActionDetails(rec);
      return {
        ...rec.toObject(),
        actionDetails
      };
    });

    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
        stock: product.stockQuantity,
        price: product.price
      },
      recommendations: recommendationsWithDetails
    });

  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product recommendations',
      error: error.message
    });
  }
};

// Dismiss a recommendation
exports.dismissRecommendation = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    const { id } = req.params;

    console.log(`Dismissing recommendation: ${id} for farmer: ${farmerId}`);

    const recommendation = await Recommendation.findOne({ _id: id, farmerId });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    recommendation.status = 'DISMISSED';
    recommendation.dismissedAt = new Date();
    await recommendation.save();

    console.log(`Recommendation ${id} dismissed successfully`);

    res.json({
      success: true,
      message: 'Recommendation dismissed successfully'
    });

  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss recommendation',
      error: error.message
    });
  }
};

// Mark recommendation as acted upon
exports.markAsActed = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    const { id } = req.params;

    console.log(`Marking recommendation as acted: ${id} for farmer: ${farmerId}`);

    const recommendation = await Recommendation.findOne({ _id: id, farmerId });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    recommendation.status = 'ACTED';
    recommendation.actedAt = new Date();
    await recommendation.save();

    console.log(`Recommendation ${id} marked as acted successfully`);

    res.json({
      success: true,
      message: 'Recommendation marked as acted',
      recommendation
    });

  } catch (error) {
    console.error('Error marking recommendation as acted:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark recommendation as acted',
      error: error.message
    });
  }
};
