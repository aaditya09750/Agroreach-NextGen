const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/emailService');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      billingAddress,
      paymentMethod,
      subtotal,
      shipping = 0,
      tax = 0,
      total,
      notes,
      currency = 'USD' // Default to USD if not provided
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Prepare order items with product details
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check stock availability
      if (product.stockStatus === 'Out of Stock') {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} units of ${product.name} available`
        });
      }

      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || ''
      });

      // Update product stock
      product.stockQuantity -= item.quantity;
      await product.save();
    }

    // Generate unique order ID
    const year = new Date().getFullYear();
    
    // Find the last order for this year to get the next sequential number
    const lastOrder = await Order.findOne({ 
      orderId: new RegExp(`^ORD-${year}-`) 
    }).sort({ createdAt: -1 });
    
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderId) {
      const lastNumber = parseInt(lastOrder.orderId.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    let orderId = `ORD-${year}-${String(nextNumber).padStart(5, '0')}`;

    // Create order with retry mechanism for duplicate key errors
    let order;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        order = new Order({
          orderId,
          user: req.user._id,
          items: orderItems,
          billingAddress,
          paymentMethod,
          subtotal,
          shipping,
          tax,
          total,
          notes,
          status: 'pending'
        });

        await order.save();
        break;
      } catch (error) {
        if (error.code === 11000 && retries < maxRetries - 1) {
          retries++;
          const timestamp = Date.now().toString().slice(-4);
          orderId = `ORD-${year}-${String(nextNumber).padStart(5, '0')}-${timestamp}`;
        } else {
          throw error;
        }
      }
    }

    if (!order) {
      throw new Error('Failed to create order after multiple attempts');
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );

    // Send order confirmation email with complete invoice
    try {
      await sendOrderConfirmation(billingAddress.email, {
        orderId: order.orderId,
        customerName: `${billingAddress.firstName} ${billingAddress.lastName}`,
        items: orderItems,
        billingAddress: billingAddress,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        currency: currency, // Pass currency for dynamic symbol
        orderDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('items.product', 'name images')
        .lean(),
      Order.countDocuments(filter),
    ]);

    const response = buildPaginationResponse(orders, total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user (unless admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};
