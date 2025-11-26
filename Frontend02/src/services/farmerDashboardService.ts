import api from './api';

export interface DashboardStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  monthlySales: number;
}

export interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  location: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  link: string;
  publishedAt: string;
}

export const farmerDashboardService = {
  // Get overview stats
  async getOverviewStats() {
    try {
      const response = await api.get('/farmer/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get sales graph data
  async getSalesGraphData(period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') {
    try {
      const response = await api.get(`/farmer/dashboard/sales-graph?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Get sales graph data error:', error);
      throw error;
    }
  },

  // Get weather data (using external API)
  async getWeatherData(location: string) {
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      
      return {
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        location: data.name,
      };
    } catch (error) {
      console.error('Get weather data error:', error);
      // Return mock data if API fails
      return {
        temp: 28,
        humidity: 65,
        windSpeed: 12,
        description: 'Partly cloudy',
        icon: '02d',
        location: location,
      };
    }
  },

  // Get agriculture news
  async getAgricultureNews() {
    try {
      const response = await api.get('/farmer/dashboard/news');
      return response.data;
    } catch (error) {
      console.error('Get agriculture news error:', error);
      // Return mock news if API fails
      return {
        success: true,
        data: [
          {
            id: '1',
            title: 'New Government Subsidy for Organic Farming',
            summary: 'Government announces new subsidy scheme for organic farmers...',
            image: 'https://via.placeholder.com/300x200',
            link: '#',
            publishedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Monsoon Forecast: Above Normal Rainfall Expected',
            summary: 'IMD predicts above normal monsoon this year...',
            image: 'https://via.placeholder.com/300x200',
            link: '#',
            publishedAt: new Date().toISOString(),
          },
          {
            id: '3',
            title: 'Smart Farming: IoT Solutions for Better Yield',
            summary: 'Learn how IoT technology can improve crop yield...',
            image: 'https://via.placeholder.com/300x200',
            link: '#',
            publishedAt: new Date().toISOString(),
          },
        ],
      };
    }
  },
};
