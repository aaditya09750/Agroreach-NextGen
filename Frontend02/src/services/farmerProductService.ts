import api from './api';

export interface ProductRequest {
  _id?: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  rejectionReason?: string;
  createdAt?: string;
}

export const farmerProductService = {
  // Submit product sell request
  async submitProductRequest(data: FormData) {
    try {
      const response = await api.post('/farmer/products/request', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Submit product request error:', error);
      throw error;
    }
  },

  // Get all product requests
  async getProductRequests() {
    try {
      const response = await api.get('/farmer/products/requests');
      return response.data;
    } catch (error) {
      console.error('Get product requests error:', error);
      throw error;
    }
  },

  // Get single product request
  async getProductRequestById(id: string) {
    try {
      const response = await api.get(`/farmer/products/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get product request error:', error);
      throw error;
    }
  },

  // Update product request
  async updateProductRequest(id: string, data: FormData) {
    try {
      const response = await api.put(`/farmer/products/requests/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update product request error:', error);
      throw error;
    }
  },

  // Delete product request
  async deleteProductRequest(id: string) {
    try {
      const response = await api.delete(`/farmer/products/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete product request error:', error);
      throw error;
    }
  },
};
