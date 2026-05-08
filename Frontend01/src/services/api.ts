import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // Fail loud so missing env is obvious in production
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

// Attach the right token based on the route the user is on
api.interceptors.request.use(
  (config) => {
    const currentPath = window.location.pathname;
    const isAdminPath = currentPath.startsWith('/admin');

    const token = isAdminPath
      ? localStorage.getItem('admin_token')
      : localStorage.getItem('user_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handling — clear stale token and bounce to the right login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicRoutes = ['/', '/shop', '/about', '/contact', '/signin', '/signup'];
      const isPublicRoute = publicRoutes.some(
        (route) => currentPath === route || currentPath.startsWith(route)
      );

      if (currentPath.startsWith('/admin')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        if (currentPath !== '/admin') {
          window.location.href = '/admin';
        }
      } else if (!isPublicRoute) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_user');
        if (currentPath !== '/signin') {
          window.location.href = '/signin';
        }
      } else {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
