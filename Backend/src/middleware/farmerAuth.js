const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

exports.farmerAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get farmer from token
      const farmer = await Farmer.findById(decoded.id).select('-password');
      
      if (!farmer) {
        return res.status(401).json({
          success: false,
          message: 'Farmer not found'
        });
      }

      req.farmer = farmer;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.error('Farmer auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};
