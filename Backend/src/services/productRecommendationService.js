const Product = require('../models/Product');

// Category mappings for perishability
const PERISHABLE_CATEGORIES = ['fruits', 'vegetables', 'dairy'];
const SHELF_LIFE_DAYS = {
  fruits: 7,
  vegetables: 10,
  dairy: 5,
  grains: 180,
  organic: 14
};

// Analyze inventory and generate recommendations
const analyzeInventory = async (farmerId, products, stats) => {
  const recommendations = [];
  const currentDate = new Date();

  // Calculate averages
  const avgStock = products.length > 0 
    ? products.reduce((sum, p) => sum + p.stockQuantity, 0) / products.length 
    : 0;

  for (const product of products) {
    const daysSinceCreated = Math.floor((currentDate - new Date(product.createdAt)) / (1000 * 60 * 60 * 24));
    const isPerishable = PERISHABLE_CATEGORIES.includes(product.category.toLowerCase());
    const shelfLife = SHELF_LIFE_DAYS[product.category.toLowerCase()] || 30;

    // 1. Emergency Auction Mode (CRITICAL - Perishable goods near expiry)
    if (isPerishable && daysSinceCreated >= shelfLife * 0.5 && product.stockQuantity > 20) {
      recommendations.push({
        type: 'EMERGENCY_AUCTION',
        priority: 'CRITICAL',
        productId: product._id,
        productName: product.name,
        title: '🚨 Emergency Sale Required',
        message: `Your ${product.name} (${product.stockQuantity} ${product.stockUnit}) needs immediate sale! It's ${daysSinceCreated} days old.`,
        actionData: {
          type: 'QUICK_AUCTION',
          currentPrice: product.price,
          suggestedPrice: (product.price * 0.75).toFixed(2),
          stockQuantity: product.stockQuantity,
          daysOld: daysSinceCreated,
          expectedOutcome: `Quick sale of ${product.stockQuantity} ${product.stockUnit}`,
          urgencyReason: 'Approaching perishability limit'
        },
        icon: '🚨',
        color: 'red'
      });
    }

    // 2. Flash Sale System (HIGH - Overstock situation)
    // Trigger for high stock even on fresh products to move inventory quickly
    if (product.stockQuantity > 50 && product.discount < 20) {
      const suggestedDiscount = Math.min(15 + Math.floor(daysSinceCreated / 3) * 5, 35);
      const potentialRevenue = (product.price * (1 - suggestedDiscount / 100) * product.stockQuantity).toFixed(2);

      recommendations.push({
        type: 'FLASH_SALE',
        priority: 'HIGH',
        productId: product._id,
        productName: product.name,
        title: '⚡ Flash Sale Opportunity',
        message: `Launch a flash sale for ${product.name}! High stock detected (${product.stockQuantity} ${product.stockUnit}).`,
        actionData: {
          type: 'APPLY_DISCOUNT',
          currentPrice: product.price,
          currentDiscount: product.discount,
          suggestedDiscount: suggestedDiscount,
          duration: '3-5 days',
          potentialRevenue: `₹${potentialRevenue}`,
          stockQuantity: product.stockQuantity,
          expectedOutcome: `Move inventory quickly with ${suggestedDiscount}% discount`
        },
        icon: '⚡',
        color: 'orange'
      });
    }

    // 3. Bulk Buyer / Wholesale Mode (MEDIUM - Large quantity)
    if (product.stockQuantity >= 50 && product.stockUnit === 'kg') {
      const wholesalePrice = (product.price * 0.85).toFixed(2);
      const minBulkQuantity = Math.floor(product.stockQuantity * 0.2);

      recommendations.push({
        type: 'BULK_MODE',
        priority: 'MEDIUM',
        productId: product._id,
        productName: product.name,
        title: '📦 Enable Wholesale Mode',
        message: `You have ${product.stockQuantity} ${product.stockUnit} of ${product.name}. Attract bulk buyers with volume discounts!`,
        actionData: {
          type: 'ENABLE_WHOLESALE',
          currentPrice: product.price,
          wholesalePrice: wholesalePrice,
          minBulkQuantity: minBulkQuantity,
          stockQuantity: product.stockQuantity,
          savingsForBuyers: `${((1 - 0.85) * 100).toFixed(0)}%`,
          expectedOutcome: `Faster inventory turnover through bulk sales`
        },
        icon: '📦',
        color: 'blue'
      });
    }

    // 4. Processing / Value-Addition (MEDIUM - Perishable goods)
    // Suggest processing options for any perishable product with decent quantity
    if (isPerishable && product.stockQuantity >= 30) {
      const processingOptions = {
        fruits: ['Dried fruits', 'Fruit jam', 'Frozen fruits', 'Fruit juice'],
        vegetables: ['Pickled vegetables', 'Frozen vegetables', 'Dried vegetables', 'Vegetable powder'],
        dairy: ['Paneer', 'Ghee', 'Yogurt', 'Cheese']
      };

      const options = processingOptions[product.category.toLowerCase()] || ['Processed goods'];

      recommendations.push({
        type: 'VALUE_ADDITION',
        priority: 'MEDIUM',
        productId: product._id,
        productName: product.name,
        title: '🏭 Processing Opportunity',
        message: `Convert ${product.name} into value-added products to extend shelf life and increase margins!`,
        actionData: {
          type: 'PROCESSING_SUGGESTION',
          currentStock: product.stockQuantity,
          processingOptions: options,
          shelfLifeExtension: '30-180 days',
          marginIncrease: '40-60%',
          expectedOutcome: `Transform perishable goods into long-lasting products`
        },
        icon: '🏭',
        color: 'green'
      });
    }
  }

  // 5. Insurance Advisory (LOW - High value inventory)
  const totalValue = parseFloat(stats.totalValue);
  if (totalValue >= 10000) {
    recommendations.push({
      type: 'INSURANCE',
      priority: 'LOW',
      productId: null,
      productName: 'All Products',
      title: '🛡️ Protect Your Inventory',
      message: `Your inventory is worth ₹${stats.totalValue}. Consider crop insurance to protect against losses.`,
      actionData: {
        type: 'INSURANCE_ADVISORY',
        totalValue: stats.totalValue,
        estimatedPremium: (totalValue * 0.02).toFixed(2),
        coverage: '100% inventory value',
        benefits: ['Weather damage', 'Pest damage', 'Market price crash', 'Storage losses'],
        expectedOutcome: `Financial security for your ₹${stats.totalValue} inventory`
      },
      icon: '🛡️',
      color: 'purple'
    });
  }

  // Prioritize recommendations
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top 5 most important
  return recommendations.slice(0, 5);
};

// Generate specific action details based on recommendation type
const getActionDetails = (recommendation) => {
  const actions = {
    EMERGENCY_AUCTION: {
      steps: [
        'Reduce price by 25% immediately',
        'Mark as "Quick Sale" with countdown timer',
        'Promote on social media and WhatsApp',
        'Contact regular bulk buyers directly'
      ],
      implementationTime: '1-2 hours',
      expectedResult: 'Sell 70-90% of stock within 24-48 hours'
    },
    FLASH_SALE: {
      steps: [
        `Apply ${recommendation.actionData.suggestedDiscount}% discount`,
        'Set sale duration: 3-5 days',
        'Add "Flash Sale" badge to product',
        'Send notification to app users',
        'Create urgency with limited-time offer'
      ],
      implementationTime: '30 minutes',
      expectedResult: 'Increase sales velocity by 200-300%'
    },
    BULK_MODE: {
      steps: [
        `Enable wholesale pricing: ₹${recommendation.actionData.wholesalePrice}/kg`,
        `Set minimum order: ${recommendation.actionData.minBulkQuantity} kg`,
        'Add "Bulk Discount Available" badge',
        'Contact hotels, restaurants, retailers',
        'Offer free delivery for bulk orders'
      ],
      implementationTime: '1 hour',
      expectedResult: 'Attract 5-10 bulk buyers per week'
    },
    VALUE_ADDITION: {
      steps: [
        'Contact local food processing units',
        'Get quotes for processing services',
        'Choose best value-addition option',
        'Process goods in batches',
        'Relist as processed products with 40-60% margin'
      ],
      implementationTime: '2-5 days',
      expectedResult: 'Transform into products with 6-month shelf life'
    },
    INSURANCE: {
      steps: [
        'Compare crop insurance providers',
        'Get quotes for inventory coverage',
        'Choose comprehensive plan',
        'Submit inventory documentation',
        'Pay premium and activate coverage'
      ],
      implementationTime: '1-2 days',
      expectedResult: 'Full protection against losses'
    }
  };

  return actions[recommendation.type] || {};
};

module.exports = {
  analyzeInventory,
  getActionDetails
};
