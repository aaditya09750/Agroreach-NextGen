import api from './api';

export interface ProductRequest {
  _id: string;
  farmerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    landAreaSize: number;
  };
  farmerName: string;
  farmerEmail: string;
  farmerPhone: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  total: number;
}

const adminProductRequestService = {
  // Get all requests with optional filters
  getAllRequests: async (status?: string, category?: string): Promise<ProductRequest[]> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (category && category !== 'all') params.append('category', category);
    
    const response = await api.get(`/admin/product-requests?${params.toString()}`);
    return response.data.data;
  },

  // Get single request details
  getRequestById: async (id: string): Promise<ProductRequest> => {
    const response = await api.get(`/admin/product-requests/${id}`);
    return response.data.data;
  },

  // Accept request
  acceptRequest: async (id: string): Promise<ProductRequest> => {
    const response = await api.put(`/admin/product-requests/${id}/accept`);
    return response.data.data;
  },

  // Reject request
  rejectRequest: async (id: string, rejectionReason: string): Promise<ProductRequest> => {
    const response = await api.put(`/admin/product-requests/${id}/reject`, {
      rejectionReason
    });
    return response.data.data;
  },

  // Get statistics
  getStats: async (): Promise<RequestStats> => {
    const response = await api.get('/admin/product-requests/stats');
    return response.data.data;
  },
};

export default adminProductRequestService;
