import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, ChevronDown, Calendar, User, Mail, Phone, MapPin, Package, DollarSign, X } from 'lucide-react';
import adminProductRequestService, { ProductRequest } from '../../services/adminProductRequestService';

const AdminProductRequests: React.FC = () => {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    total: 0
  });

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'dairy', label: 'Dairy' },
  ];

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, requests]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminProductRequestService.getAllRequests(
        filterStatus === 'all' ? undefined : filterStatus,
        filterCategory === 'all' ? undefined : filterCategory
      );
      setRequests(data);
      setFilteredRequests(data);
    } catch (error: any) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminProductRequestService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredRequests(requests);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = requests.filter(
      request =>
        request.productName.toLowerCase().includes(query) ||
        request.farmerName.toLowerCase().includes(query) ||
        request.farmerEmail.toLowerCase().includes(query)
    );
    setFilteredRequests(filtered);
  };

  const handleViewDetails = (request: ProductRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleAcceptRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this request?')) return;

    try {
      await adminProductRequestService.acceptRequest(id);
      fetchRequests();
      fetchStats();
      setShowDetailsModal(false);
      alert('Request approved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!selectedRequest) return;

    try {
      await adminProductRequestService.rejectRequest(selectedRequest._id, rejectionReason);
      fetchRequests();
      fetchStats();
      setShowDetailsModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      alert('Request rejected successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
        {status === 'pending' && <Calendar size={12} />}
        {status === 'approved' && <CheckCircle size={12} />}
        {status === 'rejected' && <XCircle size={12} />}
        {status === 'completed' && <CheckCircle size={12} />}
        {statusConfig?.label || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Requests</h1>
        <p className="text-gray-600">Manage farmer product listing requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Package className="text-gray-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Calendar className="text-yellow-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <CheckCircle className="text-blue-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by product name, farmer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:border-green-500 transition-colors bg-white min-w-[150px] justify-between"
              >
                <Filter size={18} />
                <span className="text-sm">{statusOptions.find(opt => opt.value === filterStatus)?.label}</span>
                <ChevronDown size={16} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterStatus(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-600 transition-colors ${
                        filterStatus === option.value ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:border-green-500 transition-colors bg-white min-w-[180px] justify-between"
              >
                <Package size={18} />
                <span className="text-sm">{categoryOptions.find(opt => opt.value === filterCategory)?.label}</span>
                <ChevronDown size={16} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterCategory(option.value);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-600 transition-colors ${
                        filterCategory === option.value ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">No requests found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Farmer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{request.farmerName}</p>
                        <p className="text-xs text-gray-500">{request.farmerEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={`http://localhost:5000${request.images[0]}`}
                          alt={request.productName}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <span className="text-sm font-medium text-gray-800">{request.productName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700 capitalize">{request.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700">{request.quantity} {request.unit}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-800">{formatPrice(request.pricePerUnit)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{formatDate(request.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(request.status)}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewDetails(request)}
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

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Request Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedRequest.status)}
                <span className="text-sm text-gray-500">
                  Submitted on {formatDate(selectedRequest.createdAt)}
                </span>
              </div>

              {/* Product Image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Image</h3>
                <img
                  src={`http://localhost:5000${selectedRequest.images[0]}`}
                  alt={selectedRequest.productName}
                  className="w-64 h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Product Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product Name</p>
                    <p className="text-sm font-medium text-gray-800">{selectedRequest.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-sm font-medium text-gray-800 capitalize">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="text-sm font-medium text-gray-800">{selectedRequest.quantity} {selectedRequest.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price per Unit</p>
                    <p className="text-sm font-medium text-gray-800">{formatPrice(selectedRequest.pricePerUnit)}</p>
                  </div>
                </div>
              </div>

              {/* Farmer Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Farmer Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <User className="text-gray-400 mt-1" size={16} />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.farmerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="text-gray-400 mt-1" size={16} />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.farmerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="text-gray-400 mt-1" size={16} />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-800">{selectedRequest.farmerPhone}</p>
                    </div>
                  </div>
                  {selectedRequest.farmerId?.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="text-gray-400 mt-1" size={16} />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="text-sm font-medium text-gray-800">{selectedRequest.farmerId.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason if rejected */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h3>
                  <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAcceptRequest(selectedRequest._id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={20} />
                    Accept Request
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle size={20} />
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Reject Request</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductRequests;
