import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, User, Package, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import adminFarmerService, { FarmerWithStats } from '../../services/adminFarmerService';
import adminProductRequestService, { ProductRequest } from '../../services/adminProductRequestService';
import { getImageUrl } from '../../utils/imageUtils';

const AdminFarmers: React.FC = () => {
  const [farmers, setFarmers] = useState<FarmerWithStats[]>([]);
  const [filteredFarmers, setFilteredFarmers] = useState<FarmerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerWithStats | null>(null);
  const [farmerRequests, setFarmerRequests] = useState<ProductRequest[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, farmers]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const data = await adminFarmerService.getAllFarmers();
      setFarmers(data);
      setFilteredFarmers(data);
    } catch (error: any) {
      console.error('Failed to fetch farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredFarmers(farmers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = farmers.filter(
      farmer =>
        farmer.name.toLowerCase().includes(query) ||
        farmer.email.toLowerCase().includes(query) ||
        farmer.location.toLowerCase().includes(query) ||
        farmer.phone.includes(query)
    );
    setFilteredFarmers(filtered);
  };

  const handleViewDetails = async (farmer: FarmerWithStats) => {
    setSelectedFarmer(farmer);
    setShowDetailsModal(true);
    setLoadingRequests(true);
    
    try {
      const requests = await adminFarmerService.getFarmerRequests(farmer._id);
      setFarmerRequests(requests);
    } catch (error: any) {
      console.error('Failed to fetch farmer requests:', error);
      setFarmerRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleToggleVerification = async (farmerId: string) => {
    try {
      await adminFarmerService.toggleVerification(farmerId);
      fetchFarmers();
      if (selectedFarmer && selectedFarmer._id === farmerId) {
        const updatedFarmer = await adminFarmerService.getFarmerById(farmerId);
        setSelectedFarmer(updatedFarmer);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update verification status');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to accept this product request?')) return;

    setIsSubmitting(true);
    try {
      console.log('Accepting request:', requestId);
      const result = await adminProductRequestService.acceptRequest(requestId);
      console.log('Acceptance successful:', result);
      
      alert('Product request accepted successfully!');
      
      // Refresh the requests list and farmer stats
      if (selectedFarmer) {
        console.log('Refreshing farmer data...');
        const requests = await adminFarmerService.getFarmerRequests(selectedFarmer._id);
        console.log('Updated requests:', requests);
        setFarmerRequests(requests);
        
        const updatedFarmer = await adminFarmerService.getFarmerById(selectedFarmer._id);
        console.log('Updated farmer stats:', updatedFarmer);
        setSelectedFarmer(updatedFarmer);
      }
      await fetchFarmers();
      console.log('All data refreshed successfully');
    } catch (error: any) {
      console.error('Acceptance error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectRequest = (request: ProductRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Rejecting request:', selectedRequest._id, 'with reason:', rejectionReason);
      const result = await adminProductRequestService.rejectRequest(selectedRequest._id, rejectionReason);
      console.log('Rejection successful:', result);
      
      alert('Product request rejected successfully!');
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      // Refresh the requests list and farmer stats
      if (selectedFarmer) {
        console.log('Refreshing farmer data...');
        const requests = await adminFarmerService.getFarmerRequests(selectedFarmer._id);
        console.log('Updated requests:', requests);
        setFarmerRequests(requests);
        
        const updatedFarmer = await adminFarmerService.getFarmerById(selectedFarmer._id);
        console.log('Updated farmer stats:', updatedFarmer);
        setSelectedFarmer(updatedFarmer);
      }
      await fetchFarmers();
      console.log('All data refreshed successfully');
    } catch (error: any) {
      console.error('Rejection error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: string; icon: any } } = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Package },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const totalFarmers = farmers.length;
  const verifiedFarmers = farmers.filter(f => f.isVerified).length;
  const totalRequests = farmers.reduce((sum, f) => sum + (f.totalRequests || 0), 0);
  const totalActiveProducts = farmers.reduce((sum, f) => sum + (f.activeProducts || 0), 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Farmers</h1>
        <p className="text-gray-600">Manage registered farmers and their product requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Farmers</p>
              <p className="text-2xl font-bold text-gray-800">{totalFarmers}</p>
            </div>
            <User className="text-gray-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Verified Farmers</p>
              <p className="text-2xl font-bold text-green-600">{verifiedFarmers}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
            </div>
            <Package className="text-blue-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Products</p>
              <p className="text-2xl font-bold text-purple-600">{totalActiveProducts}</p>
            </div>
            <Package className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, location, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">Loading farmers...</p>
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">No farmers found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Farmer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Land Area</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Requests</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Products</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {farmer.photo ? (
                          <img
                            src={getImageUrl(farmer.photo)}
                            alt={farmer.name}
                            className="w-10 h-10 object-cover rounded-full border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="text-green-600" size={20} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">{farmer.name}</p>
                          {farmer.farmName && (
                            <p className="text-xs text-gray-500">{farmer.farmName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          {farmer.email}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {farmer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{farmer.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700">{farmer.landAreaSize} acres</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-center">
                        <span className="text-sm font-medium text-gray-800">{farmer.totalRequests || 0}</span>
                        <p className="text-xs text-gray-500">
                          {farmer.approvedRequests || 0} approved
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-green-600">{farmer.activeProducts || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      {farmer.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle size={12} />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{formatDate(farmer.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewDetails(farmer)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Farmer Details Modal */}
      {showDetailsModal && selectedFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Farmer Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Farmer Info */}
              <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                {selectedFarmer.photo ? (
                  <img
                    src={getImageUrl(selectedFarmer.photo)}
                    alt={selectedFarmer.name}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-green-100 flex items-center justify-center">
                    <User className="text-green-600" size={40} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{selectedFarmer.name}</h3>
                    {selectedFarmer.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle size={12} />
                        Unverified
                      </span>
                    )}
                  </div>
                  {selectedFarmer.farmName && (
                    <p className="text-gray-600 mb-3">{selectedFarmer.farmName}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-700">{selectedFarmer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-700">{selectedFarmer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-700">{selectedFarmer.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-700">{selectedFarmer.landAreaSize} acres</span>
                    </div>
                  </div>
                  {selectedFarmer.address && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Address: {selectedFarmer.address}</p>
                      {selectedFarmer.zipcode && (
                        <p className="text-sm text-gray-600">Zipcode: {selectedFarmer.zipcode}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedFarmer.totalRequests || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{selectedFarmer.approvedRequests || 0}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{selectedFarmer.rejectedRequests || 0}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Active Products</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedFarmer.activeProducts || 0}</p>
                </div>
              </div>

              {/* Product Requests */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Requests</h3>
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading requests...</p>
                  </div>
                ) : farmerRequests.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Package className="mx-auto mb-2 text-gray-400" size={40} />
                    <p className="text-gray-600">No product requests yet</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {farmerRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getImageUrl(request.images[0])}
                                  alt={request.productName}
                                  className="w-10 h-10 object-cover rounded border border-gray-200"
                                />
                                <span className="text-sm font-medium text-gray-800">{request.productName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700 capitalize">{request.category}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">{request.quantity} {request.unit}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-800">₹{request.pricePerUnit}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{formatDate(request.createdAt)}</span>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                            <td className="py-3 px-4">
                              {request.status === 'pending' && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAcceptRequest(request._id)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle size={14} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(request)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <XCircle size={14} />
                                    Reject
                                  </button>
                                </div>
                              )}
                              {request.status === 'approved' && (
                                <span className="text-xs text-green-600 font-medium">Approved</span>
                              )}
                              {request.status === 'rejected' && (
                                <span className="text-xs text-red-600 font-medium">Rejected</span>
                              )}
                              {request.status === 'completed' && (
                                <span className="text-xs text-blue-600 font-medium">Completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleVerification(selectedFarmer._id)}
                  className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
                    selectedFarmer.isVerified
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedFarmer.isVerified ? 'Unverify Farmer' : 'Verify Farmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Reject Product Request</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={getImageUrl(selectedRequest.images[0])}
                  alt={selectedRequest.productName}
                  className="w-12 h-12 object-cover rounded border border-gray-200"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedRequest.productName}</p>
                  <p className="text-xs text-gray-600 capitalize">{selectedRequest.category}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this request..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFarmers;
