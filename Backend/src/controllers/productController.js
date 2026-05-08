const Product = require('../models/Product');
const NodeCache = require('node-cache');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');
const imageHandler = require('../utils/imageHandler');

const productCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    // 60-second cache keyed on full query — busiest endpoint
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = productCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const {
      category,
      minPrice,
      maxPrice,
      tags,
      sort,
      page,
      limit,
      search,
      status,
      isHotDeal,
      isBestSeller,
      isTopRated
    } = req.query;

    // Build filter query
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (isHotDeal === 'true') {
      filter.isHotDeal = true;
    }

    if (isBestSeller === 'true') {
      filter.isBestSeller = true;
    }

    if (isTopRated === 'true') {
      filter.isTopRated = true;
    }

    // Build sort query
    let sortQuery = { createdAt: -1 }; // Default: newest first

    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortQuery = { price: 1 };
          break;
        case 'price-desc':
          sortQuery = { price: -1 };
          break;
        case 'rating':
          sortQuery = { rating: -1 };
          break;
        case 'name':
          sortQuery = { name: 1 };
          break;
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
    }

    // Pagination
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    // Get products + total in parallel
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate('seller', 'firstName lastName email')
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Build response
    const response = buildPaginationResponse(products, total, pageNum, limitNum);

    const payload = { success: true, ...response };
    productCache.set(cacheKey, payload);

    res.status(200).json(payload);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(req.params.id)
      .populate('seller', 'firstName lastName email')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      seller: req.user._id
    };

    // Set default stockQuantity if not provided or empty
    if (!productData.stockQuantity || productData.stockQuantity === '') {
      productData.stockQuantity = 0;
    }

    // Handle image uploads (file.path is Cloudinary secure_url)
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
    }

    const product = await Product.create(productData);
    productCache.flushAll();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);

    // Clean up uploaded files if product creation failed
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imageHandler.deleteImage(file.path);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = { ...req.body };

    // Handle new image uploads (file.path is Cloudinary secure_url)
    if (req.files && req.files.length > 0) {
      // Delete old images if replacing
      if (product.images && product.images.length > 0) {
        await imageHandler.deleteMultipleImages(product.images);
      }

      updateData.images = req.files.map(file => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    productCache.flushAll();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);

    // Clean up uploaded files if update failed
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imageHandler.deleteImage(file.path);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product images from storage
    if (product.images && product.images.length > 0) {
      await imageHandler.deleteMultipleImages(product.images);
    }

    // Hard delete - permanently remove from database
    await Product.findByIdAndDelete(req.params.id);
    productCache.flushAll();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// @desc    Increment product view count (increments reviewCount)
// @route   PATCH /api/products/:id/view
// @access  Public
exports.incrementViewCount = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { reviewCount: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { reviewCount: product.reviewCount }
    });
  } catch (error) {
    console.error('Increment view count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating view count',
      error: error.message
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
      .limit(parseInt(limit) || 10)
      .select('name price images category')
      .lean();

    res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};
