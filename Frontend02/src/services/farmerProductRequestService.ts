import api from './api';

export interface ProductRequestData {
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  initialImage: File;
}

export interface ProductRequest {
  _id: string;
  farmerId: string;
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

export interface CompleteProductData {
  description: string;
  tags: string;
  discount: number;
  stockUnit: string;
  images: File[];
}

const farmerProductRequestService = {
  // Create new product request
  createRequest: async (data: ProductRequestData): Promise<ProductRequest> => {
    const formData = new FormData();
    formData.append('productName', data.productName);
    formData.append('category', data.category);
    formData.append('quantity', data.quantity.toString());
    formData.append('unit', data.unit);
    formData.append('pricePerUnit', data.pricePerUnit.toString());
    formData.append('initialImage', data.initialImage);

    const response = await api.post('/farmer/product-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Get all my requests
  getMyRequests: async (): Promise<ProductRequest[]> => {
    const response = await api.get('/farmer/product-requests');
    return response.data.data;
  },

  // Get single request
  getRequestById: async (id: string): Promise<ProductRequest> => {
    const response = await api.get(`/farmer/product-requests/${id}`);
    return response.data.data;
  },

  // Complete product details
  completeProduct: async (requestId: string, data: CompleteProductData): Promise<any> => {
    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('tags', data.tags);
    formData.append('discount', data.discount.toString());
    formData.append('stockUnit', data.stockUnit);
    
    data.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/farmer/product-requests/${requestId}/complete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Delete pending request
  deleteRequest: async (id: string): Promise<void> => {
    await api.delete(`/farmer/product-requests/${id}`);
  },
};

export default farmerProductRequestService;
