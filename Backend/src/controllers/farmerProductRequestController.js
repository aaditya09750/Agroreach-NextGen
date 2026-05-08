const ProductRequest = require('../models/ProductRequest');
const Farmer = require('../models/Farmer');
const Product = require('../models/Product');

// Create a new product request
exports.createProductRequest = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    const { productName, category, quantity, unit, pricePerUnit } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product image is required' 
      });
    }
    
    const initialImage = req.file.path;
    
    // Get farmer details
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Farmer not found' 
      });
    }
    
    // Create product request
    const productRequest = new ProductRequest({
      farmerId,
      farmerName: farmer.name,
      farmerEmail: farmer.email,
      farmerPhone: farmer.phone,
      productName,
      category,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      images: [initialImage],
      status: 'pending'
    });
    
    await productRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Product request submitted successfully',
      data: productRequest
    });
  } catch (error) {
    console.error('Create product request error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all requests for the logged-in farmer
exports.getMyRequests = async (req, res) => {
  try {
    const farmerId = req.farmer.id;
    
    console.log('Fetching requests for farmer:', farmerId);
    
    const requests = await ProductRequest.find({ farmerId })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${requests.length} requests for farmer ${farmerId}`);
    requests.forEach(req => {
      console.log(`- Request ${req._id}: ${req.productName}, status: ${req.status}, rejectionReason: ${req.rejectionReason || 'N/A'}`);
    });
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.farmer.id;
    
    const request = await ProductRequest.findOne({ 
      _id: id, 
      farmerId 
    });
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Complete product details after approval
exports.completeProductDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const farmerId = req.farmer.id;
    const { 
      description, 
      tags, 
      discount, 
      stockUnit
    } = req.body;
    
    const additionalImages = req.files ? req.files.map(f => f.path) : [];
    
    // Get the approved request
    const request = await ProductRequest.findOne({
      _id: requestId,
      farmerId,
      status: 'approved'
    });
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Approved request not found' 
      });
    }
    
    // Combine initial image with additional images
    const allImages = [...(request.images || []), ...additionalImages];
    
    // Create the actual Product
    const product = new Product({
      name: request.productName,
      category: request.category,
      price: request.pricePerUnit,
      stockQuantity: request.quantity,
      stockUnit: stockUnit || 'kg',
      description: description || '',
      images: allImages.slice(0, 5), // Max 5 images
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      discount: Number(discount) || 0,
      isActive: true,
      seller: farmerId
    });
    
    await product.save();
    
    // Update request status
    request.status = 'completed';
    await request.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully and is now live!',
      data: product
    });
  } catch (error) {
    console.error('Complete product details error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete pending request
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.farmer.id;
    
    const request = await ProductRequest.findOne({ 
      _id: id, 
      farmerId,
      status: 'pending'
    });
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pending request not found' 
      });
    }
    
    await ProductRequest.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
