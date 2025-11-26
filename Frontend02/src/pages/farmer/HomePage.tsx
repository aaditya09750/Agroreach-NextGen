import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-primary-extra-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to AgroReach Farmer Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Empowering farmers with technology for better yields and fair prices
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary-600 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="border border-primary text-primary px-8 py-3 rounded-md font-medium hover:bg-primary-light transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Features for Farmers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sell Your Products</h3>
              <p className="text-gray-600">List your products and reach customers directly without middlemen.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Tools</h3>
              <p className="text-gray-600">Get price predictions and crop recommendations using AI technology.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Performance</h3>
              <p className="text-gray-600">Monitor sales, orders, and revenue with detailed analytics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
