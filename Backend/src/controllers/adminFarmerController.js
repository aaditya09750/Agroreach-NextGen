const Farmer = require('../models/Farmer');
const ProductRequest = require('../models/ProductRequest');
const Product = require('../models/Product');

// Get all farmers with stats
exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().select('-password').sort({ createdAt: -1 }).lean();

    const farmersWithStats = await Promise.all(
      farmers.map(async (farmer) => {
        const [totalRequests, approvedRequests, rejectedRequests, activeProducts] = await Promise.all([
          ProductRequest.countDocuments({ farmerId: farmer._id }),
          ProductRequest.countDocuments({ farmerId: farmer._id, status: 'approved' }),
          ProductRequest.countDocuments({ farmerId: farmer._id, status: 'rejected' }),
          Product.countDocuments({ farmerId: farmer._id }),
        ]);

        return {
          ...farmer,
          totalRequests,
          approvedRequests,
          rejectedRequests,
          activeProducts,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: farmersWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching farmers',
      error: error.message,
    });
  }
};

// Get single farmer by ID with stats
exports.getFarmerById = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).select('-password');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
    }

    // Get stats
    const totalRequests = await ProductRequest.countDocuments({ farmerId: farmer._id });
    const approvedRequests = await ProductRequest.countDocuments({
      farmerId: farmer._id,
      status: 'approved',
    });
    const rejectedRequests = await ProductRequest.countDocuments({
      farmerId: farmer._id,
      status: 'rejected',
    });
    const activeProducts = await Product.countDocuments({
      farmerId: farmer._id,
    });

    const farmerWithStats = {
      ...farmer.toObject(),
      totalRequests,
      approvedRequests,
      rejectedRequests,
      activeProducts,
    };

    res.status(200).json({
      success: true,
      data: farmerWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer',
      error: error.message,
    });
  }
};

// Get farmer's product requests
exports.getFarmerRequests = async (req, res) => {
  try {
    const requests = await ProductRequest.find({ farmerId: req.params.id }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer requests',
      error: error.message,
    });
  }
};

// Toggle farmer verification status
exports.toggleVerification = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).select('-password');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
    }

    farmer.isVerified = !farmer.isVerified;
    await farmer.save();

    // Get updated stats
    const totalRequests = await ProductRequest.countDocuments({ farmerId: farmer._id });
    const approvedRequests = await ProductRequest.countDocuments({
      farmerId: farmer._id,
      status: 'approved',
    });
    const rejectedRequests = await ProductRequest.countDocuments({
      farmerId: farmer._id,
      status: 'rejected',
    });
    const activeProducts = await Product.countDocuments({
      farmerId: farmer._id,
    });

    const farmerWithStats = {
      ...farmer.toObject(),
      totalRequests,
      approvedRequests,
      rejectedRequests,
      activeProducts,
    };

    res.status(200).json({
      success: true,
      message: `Farmer ${farmer.isVerified ? 'verified' : 'unverified'} successfully`,
      data: farmerWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating farmer verification status',
      error: error.message,
    });
  }
};
