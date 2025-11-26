import React from 'react';
import { TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';

const FarmerOverview: React.FC = () => {
  // Mock data
  const stats = [
    { label: 'Total Products', value: '12', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Orders', value: '8', icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Revenue', value: '₹45,230', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Monthly Sales', value: '₹12,450', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Weather Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Weather</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-gray-900">28°C</p>
            <p className="text-gray-600 mt-1">Partly Cloudy</p>
            <p className="text-sm text-gray-500 mt-2">Mumbai, Maharashtra</p>
          </div>
          <div className="text-6xl">☁️</div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Humidity</p>
            <p className="text-lg font-semibold text-gray-900">65%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Wind</p>
            <p className="text-lg font-semibold text-gray-900">12 km/h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rainfall</p>
            <p className="text-lg font-semibold text-gray-900">0 mm</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Sales Graph Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Seasonal Sales Trend</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Sales graph will be integrated with recharts library</p>
        </div>
      </div>

      {/* News Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Agriculture News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-green-100 to-green-200"></div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Agriculture News Title {item}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Brief summary of the agriculture news article goes here...
                </p>
                <a href="#" className="text-sm text-primary font-medium hover:text-primary-600">
                  Read More →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerOverview;
