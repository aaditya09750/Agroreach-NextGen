import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductRequest } from '../../services/farmerProductRequestService';
import { Clock, CheckCircle, XCircle, Eye, Trash2, X } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

interface ProductRequestTableProps {
  requests: ProductRequest[];
  onDelete: (id: string) => void;
}

const ProductRequestTable: React.FC<ProductRequestTableProps> = ({ requests, onDelete }) => {
  const navigate = useNavigate();
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);

  const handleViewReason = (request: ProductRequest) => {
    setSelectedRequest(request);
    setShowReasonModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle size={12} />
            Live
          </span>
        );
      default:
        return null;
    }
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

  const getUnitLabel = (unit: string) => {
    const unitMap: { [key: string]: string } = {
      quintal: 'Quintal',
      ton: 'Ton',
      kg: 'Kg',
      bag: 'Bag',
      crate: 'Crate',
      box: 'Box',
    };
    return unitMap[unit] || unit;
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted text-sm">No requests yet. Submit a product to see your request status.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-color">
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Product</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Quantity</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id} className="border-b border-border-color hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={getImageUrl(request.images[0])}
                    alt={request.productName}
                    className="w-12 h-12 object-cover rounded-lg border border-border-color"
                  />
                  <span className="text-sm font-medium text-text-dark">{request.productName}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-text-dark-gray capitalize">{request.category}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-text-dark-gray">
                  {request.quantity} {getUnitLabel(request.unit)}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-medium text-text-dark">{formatPrice(request.pricePerUnit)}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-text-muted">{formatDate(request.createdAt)}</span>
              </td>
              <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {request.status === 'approved' && (
                    <button
                      onClick={() => navigate(`/dashboard/complete-product/${request._id}`)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Complete Details
                    </button>
                  )}
                  {request.status === 'rejected' && request.rejectionReason && (
                    <button
                      onClick={() => handleViewReason(request)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} />
                      View Reason
                    </button>
                  )}
                  {request.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this request?')) {
                          onDelete(request._id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                  {request.status === 'completed' && (
                    <span className="text-xs text-green-600 font-medium">✓ Product is live</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rejection Reason Modal */}
      {showReasonModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-dark">Request Rejected</h3>
              <button
                onClick={() => setShowReasonModal(false)}
                className="text-text-muted hover:text-text-dark transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-border-color">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={getImageUrl(selectedRequest.images[0])}
                  alt={selectedRequest.productName}
                  className="w-12 h-12 object-cover rounded-lg border border-border-color"
                />
                <div>
                  <p className="text-sm font-semibold text-text-dark">{selectedRequest.productName}</p>
                  <p className="text-xs text-text-muted capitalize">{selectedRequest.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{selectedRequest.quantity} {getUnitLabel(selectedRequest.unit)}</span>
                <span>•</span>
                <span>{formatPrice(selectedRequest.pricePerUnit)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-text-dark mb-2">
                Rejection Reason:
              </label>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-text-dark whitespace-pre-wrap">{selectedRequest.rejectionReason}</p>
              </div>
            </div>

            <button
              onClick={() => setShowReasonModal(false)}
              className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRequestTable;
