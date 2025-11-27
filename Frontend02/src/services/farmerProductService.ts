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

export interface FarmerProduct {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  stockStatus: 'In Stock' | 'Out of Stock';
  stockQuantity: number;
  stockUnit: string;
  discount: number;
  seller: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  totalValue: string;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  stockQuantity?: number;
  stockUnit?: string;
  discount?: number;
  tags?: string;
}

export interface AuditData {
  farmer: {
    name: string;
    email: string;
    phone: string;
  };
  summary: {
    totalProducts: number;
    totalValue: string;
    averagePrice: string;
    inStock: number;
    outOfStock: number;
  };
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit: string;
    status: string;
    discount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  generatedAt: string;
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

  // === PRODUCT MANAGEMENT FUNCTIONS ===

  // Get all my products
  async getMyProducts(): Promise<FarmerProduct[]> {
    try {
      const response = await api.get('/farmer/products');
      return response.data.data;
    } catch (error) {
      console.error('Get my products error:', error);
      throw error;
    }
  },

  // Get product statistics
  async getProductStats(): Promise<ProductStats> {
    try {
      const response = await api.get('/farmer/products/stats');
      return response.data.data;
    } catch (error) {
      console.error('Get product stats error:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id: string, data: UpdateProductData): Promise<FarmerProduct> {
    try {
      const response = await api.put(`/farmer/products/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/farmer/products/${id}`);
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  },

  // Get audit data
  async getAuditData(): Promise<AuditData> {
    try {
      const response = await api.get('/farmer/products/audit');
      return response.data.data;
    } catch (error) {
      console.error('Get audit data error:', error);
      throw error;
    }
  },
};
