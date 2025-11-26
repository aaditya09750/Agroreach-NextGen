import api from './api';

export interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  location: string;
  landAreaSize: number;
  photo?: string;
  address?: string;
  zipcode?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface FarmerWithStats extends Farmer {
  totalRequests?: number;
  approvedRequests?: number;
  rejectedRequests?: number;
  activeProducts?: number;
}

const adminFarmerService = {
  // Get all farmers
  getAllFarmers: async (): Promise<FarmerWithStats[]> => {
    const response = await api.get('/admin/farmers');
    return response.data.data;
  },

  // Get single farmer
  getFarmerById: async (id: string): Promise<FarmerWithStats> => {
    const response = await api.get(`/admin/farmers/${id}`);
    return response.data.data;
  },

  // Get farmer's product requests
  getFarmerRequests: async (farmerId: string): Promise<any[]> => {
    const response = await api.get(`/admin/farmers/${farmerId}/requests`);
    return response.data.data;
  },

  // Toggle farmer verification status
  toggleVerification: async (id: string): Promise<FarmerWithStats> => {
    const response = await api.put(`/admin/farmers/${id}/toggle-verification`);
    return response.data.data;
  },
};

export default adminFarmerService;
