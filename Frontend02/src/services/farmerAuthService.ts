import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  landAreaSize: number;
}

export const farmerAuthService = {
  // Register new farmer
  async register(data: RegisterData) {
    try {
      const response = await api.post('/farmer/auth/register', data);
      // Don't store token/user data on registration
      // Farmer must sign in after registration
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login farmer
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post('/farmer/auth/login', credentials);
      if (response.data.success && response.data.token) {
        localStorage.setItem('farmer_token', response.data.token);
        localStorage.setItem('farmer_user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout farmer
  logout() {
    localStorage.removeItem('farmer_token');
    localStorage.removeItem('farmer_user');
  },

  // Get stored farmer data
  getStoredFarmer() {
    const farmerData = localStorage.getItem('farmer_user');
    return farmerData ? JSON.parse(farmerData) : null;
  },

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('farmer_token');
  },

  // Check if farmer is authenticated
  isAuthenticated() {
    return !!this.getStoredToken();
  },

  // Get farmer profile
  async getProfile() {
    try {
      const response = await api.get('/farmer/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update farmer profile
  async updateProfile(data: FormData) {
    try {
      const response = await api.put('/farmer/auth/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        localStorage.setItem('farmer_user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};
