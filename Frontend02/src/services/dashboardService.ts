import api from './api';

export interface DashboardStats {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  inventoryValue: string;
  totalRevenue: string;
  monthlyRevenue: string;
  revenueGrowth: number;
  estimatedLandArea: number;
  landAreaGrowth: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  high: number;
  low: number;
  condition: string;
  feelsLike: number;
  day: string;
  date: string;
}

export interface FieldData {
  name: string;
  cropHealth: string;
  plantingDate: string;
  harvestTime: string;
  image: string;
}

export interface YieldDataPoint {
  month: string;
  value: number;
}

export interface YieldAnalysis {
  crop: string;
  year: number;
  data: YieldDataPoint[];
  totalYield: number;
}

const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/farmer/products/dashboard-stats');
      return response.data.data;
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Get weather data (mock for now - can be replaced with real weather API)
  getWeatherData: async (location: string = 'Pune'): Promise<WeatherData> => {
    // This would call a real weather API in production
    // For now, returning mock data
    const currentDate = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      location,
      temperature: 24,
      high: 27,
      low: 10,
      condition: 'Cloudy',
      feelsLike: 26,
      day: days[currentDate.getDay()],
      date: `${currentDate.getDate()} ${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}`
    };
  },

  // Get field data from farmer's products
  getFieldData: async (): Promise<FieldData[]> => {
    try {
      const response = await api.get('/farmer/products');
      const products = response.data.data;
      
      // Group products by category to create field cards
      const fields: FieldData[] = [];
      const categoryMap: { [key: string]: any[] } = {};
      
      products.forEach((product: any) => {
        const category = product.category || 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = [];
        }
        categoryMap[category].push(product);
      });
      
      // Create field data for each category
      Object.keys(categoryMap).forEach(category => {
        const categoryProducts = categoryMap[category];
        const totalStock = categoryProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
        const avgHealth = categoryProducts.filter(p => p.stockStatus === 'In Stock').length / categoryProducts.length;
        
        fields.push({
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Field`,
          cropHealth: avgHealth > 0.7 ? 'Good' : avgHealth > 0.4 ? 'Fair' : 'Needs Attention',
          plantingDate: categoryProducts[0]?.createdAt 
            ? new Date(categoryProducts[0].createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : '16 March, 2024',
          harvestTime: totalStock > 100 ? '6 months' : totalStock > 50 ? '4 months' : '2 months',
          image: categoryProducts[0]?.image || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800'
        });
      });
      
      return fields.length > 0 ? fields : [{
        name: 'Corn Field',
        cropHealth: 'Good',
        plantingDate: '16 March, 2024',
        harvestTime: '6 months',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800'
      }];
    } catch (error) {
      console.error('Get field data error:', error);
      return [{
        name: 'Corn Field',
        cropHealth: 'Good',
        plantingDate: '16 March, 2024',
        harvestTime: '6 months',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800'
      }];
    }
  },

  // Get yield analysis data
  getYieldAnalysis: async (crop: string = 'all', year: number = new Date().getFullYear()): Promise<YieldAnalysis> => {
    try {
      const response = await api.get('/farmer/products');
      const products = response.data.data;
      
      // Filter by crop if specified
      const filteredProducts = crop === 'all' 
        ? products 
        : products.filter((p: any) => p.category?.toLowerCase().includes(crop.toLowerCase()));
      
      // Generate monthly data based on product creation dates
      const monthlyData: { [key: string]: number } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize all months with 0
      months.forEach(month => {
        monthlyData[month] = 0;
      });
      
      // Aggregate product quantities by month
      filteredProducts.forEach((product: any) => {
        const createdDate = new Date(product.createdAt);
        if (createdDate.getFullYear() === year) {
          const month = months[createdDate.getMonth()];
          monthlyData[month] += product.stockQuantity || 0;
        }
      });
      
      // Convert to array format
      const data: YieldDataPoint[] = months.map(month => ({
        month,
        value: monthlyData[month]
      }));
      
      const totalYield = Object.values(monthlyData).reduce((sum, val) => sum + val, 0);
      
      return {
        crop: crop === 'all' ? 'All Crops' : crop.charAt(0).toUpperCase() + crop.slice(1),
        year,
        data,
        totalYield
      };
    } catch (error) {
      console.error('Get yield analysis error:', error);
      // Return mock data on error
      return {
        crop: crop === 'all' ? 'All Crops' : crop.charAt(0).toUpperCase() + crop.slice(1),
        year,
        data: [
          { month: 'Jan', value: 120 },
          { month: 'Feb', value: 150 },
          { month: 'Mar', value: 180 },
          { month: 'Apr', value: 160 },
          { month: 'May', value: 200 },
          { month: 'Jun', value: 220 },
          { month: 'Jul', value: 240 },
          { month: 'Aug', value: 260 },
          { month: 'Sep', value: 280 },
          { month: 'Oct', value: 300 },
          { month: 'Nov', value: 250 },
          { month: 'Dec', value: 230 }
        ],
        totalYield: 2600
      };
    }
  }
};

export default dashboardService;
