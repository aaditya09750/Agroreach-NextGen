const Product = require('../models/Product');
const Farmer = require('../models/Farmer');

// Get all products for the logged-in farmer
exports.getMyProducts = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    console.log('Fetching products for farmer:', farmerId);
    
    const products = await Product.find({ seller: farmerId })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products for farmer ${farmerId}`);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.farmer.id;
    const { 
      name, 
      price, 
      description, 
      category, 
      stockQuantity, 
      stockUnit, 
      discount,
      tags 
    } = req.body;
    
    console.log('Updating product:', id, 'for farmer:', farmerId);
    console.log('Update data:', req.body);
    
    // Find product and verify ownership
    const product = await Product.findOne({ _id: id, seller: farmerId });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found or you do not have permission to edit it' 
      });
    }
    
    // Update fields
    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (description) product.description = description;
    if (category) product.category = category;
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (stockUnit) product.stockUnit = stockUnit;
    if (discount !== undefined) product.discount = Number(discount);
    if (tags) product.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    await product.save();
    
    console.log('Product updated successfully:', id);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.farmer.id;
    
    console.log('Deleting product:', id, 'for farmer:', farmerId);
    
    // Find product and verify ownership
    const product = await Product.findOne({ _id: id, seller: farmerId });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found or you do not have permission to delete it' 
      });
    }
    
    await Product.findByIdAndDelete(id);
    
    console.log('Product deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get product statistics
exports.getProductStats = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    console.log('Calculating stats for farmer:', farmerId);
    
    const totalProducts = await Product.countDocuments({ seller: farmerId });
    const inStock = await Product.countDocuments({ 
      seller: farmerId, 
      stockStatus: 'In Stock' 
    });
    const outOfStock = await Product.countDocuments({ 
      seller: farmerId, 
      stockStatus: 'Out of Stock' 
    });
    
    // Calculate total value
    const products = await Product.find({ seller: farmerId });
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.price * product.stockQuantity);
    }, 0);
    
    console.log('Stats:', { totalProducts, inStock, outOfStock, totalValue: totalValue.toFixed(2) });
    
    res.json({
      success: true,
      data: {
        totalProducts,
        inStock,
        outOfStock,
        totalValue: totalValue.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get audit data for report generation
exports.getAuditData = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    console.log('Generating audit data for farmer:', farmerId);
    
    // Get farmer details
    const farmer = await Farmer.findById(farmerId);
    
    if (!farmer) {
      console.log('Farmer not found:', farmerId);
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    
    // Get all products with timestamps
    const products = await Product.find({ seller: farmerId })
      .sort({ createdAt: -1 });
    
    console.log(`Generating audit for ${products.length} products`);
    
    // Calculate summary stats
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
    
    const auditData = {
      farmer: {
        name: farmer.name || 'N/A',
        email: farmer.email || 'N/A',
        phone: farmer.phone || 'N/A'
      },
      summary: {
        totalProducts,
        totalValue: totalValue.toFixed(2),
        averagePrice: avgPrice.toFixed(2),
        inStock: products.filter(p => p.stockStatus === 'In Stock').length,
        outOfStock: products.filter(p => p.stockStatus === 'Out of Stock').length
      },
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stockQuantity,
        unit: p.stockUnit,
        status: p.stockStatus,
        discount: p.discount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      })),
      generatedAt: new Date().toISOString()
    };
    
    console.log('Audit data generated successfully');
    
    res.json({
      success: true,
      data: auditData
    });
  } catch (error) {
    console.error('Get audit data error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    const Order = require('../models/Order');
    
    // Get farmer info to calculate total land area from products
    const products = await Product.find({ seller: farmerId });
    
    // Calculate total products and stock
    const totalProducts = products.length;
    const inStock = products.filter(p => p.stockStatus === 'In Stock').length;
    const outOfStock = products.filter(p => p.stockStatus === 'Out of Stock').length;
    
    // Calculate inventory value
    const totalInventoryValue = products.reduce((sum, product) => {
      return sum + (product.price * product.stockQuantity);
    }, 0);
    
    // Calculate revenue from orders (sum of all delivered orders for farmer's products)
    const orders = await Order.find({ status: 'delivered' }).populate('items.product');
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let lastMonthRevenue = 0;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.seller && item.product.seller.toString() === farmerId) {
          const itemTotal = item.price * item.quantity;
          totalRevenue += itemTotal;
          
          const orderDate = new Date(order.createdAt);
          const orderMonth = orderDate.getMonth();
          const orderYear = orderDate.getFullYear();
          
          // Current month revenue
          if (orderMonth === currentMonth && orderYear === currentYear) {
            monthlyRevenue += itemTotal;
          }
          
          // Last month revenue
          if (orderMonth === lastMonth && orderYear === lastMonthYear) {
            lastMonthRevenue += itemTotal;
          }
        }
      });
    });
    
    // Calculate revenue growth percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
      : monthlyRevenue > 0 ? 100 : 0;
    
    // Estimate land area based on total product quantity (rough estimation)
    const totalQuantity = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const estimatedLandArea = (totalQuantity / 50).toFixed(2); // Rough estimate: 50 units per acre
    
    // Calculate land area growth (mock - would need historical data)
    const landAreaGrowth = 8.08;
    
    res.json({
      success: true,
      data: {
        totalProducts,
        inStock,
        outOfStock,
        inventoryValue: totalInventoryValue.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        monthlyRevenue: monthlyRevenue.toFixed(2),
        revenueGrowth: parseFloat(revenueGrowth),
        estimatedLandArea: parseFloat(estimatedLandArea),
        landAreaGrowth: parseFloat(landAreaGrowth)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
