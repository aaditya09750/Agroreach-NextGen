const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null // Null for general recommendations like insurance
  },
  productName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['EMERGENCY_AUCTION', 'FLASH_SALE', 'BULK_MODE', 'VALUE_ADDITION', 'INSURANCE'],
    required: true
  },
  priority: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    required: true,
    default: 'MEDIUM'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  actionData: {
    type: Object,
    required: true
  },
  icon: {
    type: String,
    default: '📊'
  },
  color: {
    type: String,
    default: 'blue'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DISMISSED', 'ACTED'],
    default: 'ACTIVE'
  },
  dismissedAt: {
    type: Date,
    default: null
  },
  actedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
recommendationSchema.index({ farmerId: 1, status: 1 });
recommendationSchema.index({ productId: 1, status: 1 });
recommendationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
