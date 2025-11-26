const ProductRequest = require('../models/ProductRequest');
const Farmer = require('../models/Farmer');

// Get all product requests with filters
exports.getAllRequests = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    
    const requests = await ProductRequest.find(query)
      .populate('farmerId', 'name email phone location landAreaSize')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get all requests error:', error);
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
    
    const request = await ProductRequest.findById(id)
      .populate('farmerId', 'name email phone location landAreaSize');
    
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

// Accept product request
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const request = await ProductRequest.findById(id);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Request has already been reviewed' 
      });
    }
    
    // Update request status
    request.status = 'approved';
    request.approvedBy = adminId;
    request.approvedAt = new Date();
    await request.save();
    
    res.json({ 
      success: true, 
      message: 'Request approved successfully',
      data: request
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Reject product request
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;
    
    console.log('Reject request called:', { id, rejectionReason, adminId });
    
    if (!rejectionReason || !rejectionReason.trim()) {
      console.log('Rejection failed: No reason provided');
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }
    
    const request = await ProductRequest.findById(id);
    if (!request) {
      console.log('Rejection failed: Request not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }
    
    console.log('Current request status:', request.status);
    
    if (request.status !== 'pending') {
      console.log('Rejection failed: Request already reviewed');
      return res.status(400).json({ 
        success: false, 
        message: 'Request has already been reviewed' 
      });
    }
    
    // Update request status
    request.status = 'rejected';
    request.rejectionReason = rejectionReason;
    request.approvedBy = adminId;
    request.approvedAt = new Date();
    
    console.log('Saving rejected request with data:', {
      status: request.status,
      rejectionReason: request.rejectionReason,
      approvedBy: request.approvedBy,
      approvedAt: request.approvedAt
    });
    
    await request.save();
    
    console.log('Request rejected successfully:', request._id);
    
    res.json({ 
      success: true, 
      message: 'Request rejected successfully',
      data: request
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const pending = await ProductRequest.countDocuments({ status: 'pending' });
    const approved = await ProductRequest.countDocuments({ status: 'approved' });
    const rejected = await ProductRequest.countDocuments({ status: 'rejected' });
    const completed = await ProductRequest.countDocuments({ status: 'completed' });
    
    res.json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        completed,
        total: pending + approved + rejected + completed
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
