import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmer_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicRoutes = ['/', '/contact', '/signin', '/signup'];
      const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route));
      
      if (!isPublicRoute) {
        localStorage.removeItem('farmer_token');
        localStorage.removeItem('farmer_user');
        if (currentPath !== '/signin') {
          window.location.href = '/signin';
        }
      } else {
        localStorage.removeItem('farmer_token');
        localStorage.removeItem('farmer_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
