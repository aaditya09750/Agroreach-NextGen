import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.error('VITE_API_BASE_URL is not set — API calls will fail.');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach farmer token to authenticated endpoints
api.interceptors.request.use(
  (config) => {
    const publicEndpoints = ['/contact', '/newsletter/subscribe', '/newsletter/unsubscribe'];
    const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      const token = localStorage.getItem('farmer_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handling — wipe token and bounce to /signin if user is on a protected route
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicRoutes = ['/', '/contact', '/signin', '/signup'];
      const isPublicRoute = publicRoutes.some(
        (route) => currentPath === route || currentPath.startsWith(route)
      );

      localStorage.removeItem('farmer_token');
      localStorage.removeItem('farmer_user');

      if (!isPublicRoute && currentPath !== '/signin') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
