const Farmer = require('../models/Farmer');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary } = require('../utils/imageHandler');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new farmer
// @route   POST /api/farmer/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, farmName, location, landAreaSize } = req.body;

    // Check if farmer already exists
    const farmerExists = await Farmer.findOne({ email });
    if (farmerExists) {
      return res.status(400).json({
        success: false,
        message: 'Farmer already exists with this email'
      });
    }

    // Create farmer
    const farmer = await Farmer.create({
      name,
      email,
      password,
      phone,
      farmName,
      location,
      landAreaSize
    });

    if (farmer) {
      res.status(201).json({
        success: true,
        message: 'Farmer registered successfully',
        data: farmer,
        token: generateToken(farmer._id)
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid farmer data'
      });
    }
  } catch (error) {
    console.error('Farmer registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login farmer
// @route   POST /api/farmer/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for farmer email
    const farmer = await Farmer.findOne({ email }).select('+password');
    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isPasswordMatch = await farmer.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: farmer,
      token: generateToken(farmer._id)
    });
  } catch (error) {
    console.error('Farmer login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get farmer profile
// @route   GET /api/farmer/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer.id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      data: farmer
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update farmer profile
// @route   PUT /api/farmer/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer.id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Update fields
    if (req.body.name) farmer.name = req.body.name;
    if (req.body.phone) farmer.phone = req.body.phone;
    if (req.body.farmName) farmer.farmName = req.body.farmName;
    if (req.body.location) farmer.location = req.body.location;
    if (req.body.landAreaSize) farmer.landAreaSize = req.body.landAreaSize;
    if (req.body.address) farmer.address = req.body.address;
    if (req.body.zipcode) farmer.zipcode = req.body.zipcode;

    // Handle photo upload if present
    if (req.file) {
      // Store the relative path to the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      farmer.photo = imageUrl;
      console.log('Photo uploaded successfully:', imageUrl);
    }

    const updatedFarmer = await farmer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedFarmer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
