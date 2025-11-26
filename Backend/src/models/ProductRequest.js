const mongoose = require('mongoose');

const productRequestSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetables', 'fruits', 'grains', 'dairy']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['quintal', 'ton', 'kg', 'bag', 'crate', 'box']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
productRequestSchema.index({ farmerId: 1, status: 1 });
productRequestSchema.index({ createdAt: -1 });

const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);

module.exports = ProductRequest;
