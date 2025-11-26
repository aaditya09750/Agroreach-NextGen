import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import DashboardBanner from '../../components/sections/DashboardBanner';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import ProfileCard from '../../components/dashboard/ProfileCard';
import BillingAddressCard from '../../components/dashboard/BillingAddressCard';
// import OrderHistoryTable from '../../components/dashboard/OrderHistoryTable';
import AccountSettingsForm from '../../components/settings/AccountSettingsForm';
import BillingAddressForm from '../../components/settings/BillingAddressForm';
import Dropdown from '../../components/ui/Dropdown';
import ProductRequestTable from '../../components/farmer/ProductRequestTable';
import farmerProductRequestService, { ProductRequest } from '../../services/farmerProductRequestService';
import { useNotification } from '../../context/NotificationContext';

const DashboardOverview: React.FC = () => {
  return (
    <section className="space-y-6">
      {/* Greeting Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-text-dark mb-2">Good Morning !</h1>
        <p className="text-text-dark-gray text-sm">Optimize Your Farm Operations with Real-Time Insights</p>
      </div>

      {/* Top Row: Weather, Total Land Area, Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="border border-border-color rounded-lg p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-text-dark">Chicago</span>
          </div>
          <div className="mb-4">
            <div className="text-sm text-text-dark-gray mb-1">Monday</div>
            <div className="text-xs text-text-muted">27 Aug, 2024</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-semibold text-text-dark mb-1">24° C</div>
              <div className="text-sm text-text-dark-gray">High: 27 Low: 10</div>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-2">⛅</div>
              <div className="text-lg font-medium text-text-dark">Cloudy</div>
              <div className="text-xs text-text-muted">Feels Like 26</div>
            </div>
          </div>
        </div>

        {/* Total Land Area Card */}
        <div className="border border-border-color rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted">Total Land Area</h3>
            <button className="w-8 h-8 rounded-full bg-primary hover:bg-primary text-white flex items-center justify-center text-xl font-medium transition-colors">+</button>
          </div>
          <div className="text-4xl font-semibold text-text-dark mb-2">1,200 acres</div>
          <div className="text-sm text-primary font-medium">+8.08% from last month</div>
        </div>

        {/* Revenue Card */}
        <div className="border border-border-color rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted">Revenue</h3>
            <button className="w-8 h-8 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white flex items-center justify-center transition-colors">💵</button>
          </div>
          <div className="text-4xl font-semibold text-text-dark mb-2">$50,000</div>
          <div className="text-sm text-primary font-medium">+12.45% from last month</div>
        </div>
      </div>

      {/* Monthly Yield Analysis & Corn Field */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Yield Analysis */}
        <div className="border border-border-color rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-dark">Monthly Yield Analysis</h3>
            <div className="flex gap-2">
              <select className="text-sm text-text-dark-gray border border-border-color rounded px-3 py-1.5 outline-none focus:border-primary">
                <option>Corn</option>
                <option>Wheat</option>
                <option>Rice</option>
              </select>
              <select className="text-sm text-text-dark-gray border border-border-color rounded px-3 py-1.5 outline-none focus:border-primary">
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
          </div>
          <div className="h-64 relative">
            <svg viewBox="0 0 500 250" className="w-full h-full">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00B207" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#00B207" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
              <path d="M 0 180 L 70 160 L 140 120 L 210 140 L 280 100 L 350 120 L 420 80 L 500 60" 
                    fill="url(#gradient)"/>
              <path d="M 0 180 L 70 160 L 140 120 L 210 140 L 280 100 L 350 120 L 420 80 L 500 60" 
                    stroke="#00B207" strokeWidth="3" fill="none"/>
              <circle cx="280" cy="100" r="6" fill="#00B207"/>
              <rect x="260" y="70" width="70" height="30" fill="#00B207" rx="4"/>
              <text x="295" y="90" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">300T</text>
            </svg>
          </div>
        </div>

        {/* Corn Field Card */}
        <div className="border border-border-color rounded-lg overflow-hidden bg-white">
          <div className="relative h-full min-h-[300px]" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <select className="bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white font-medium outline-none">
                  <option>Corn Field</option>
                  <option>Wheat Field</option>
                  <option>Rice Field</option>
                </select>
                <button className="text-sm font-medium hover:underline">More Details →</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs opacity-80 mb-1">Crop Health</div>
                  <div className="font-medium">Good</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Planting Date</div>
                  <div className="font-medium">16 March, 2024</div>
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">Harvest Time</div>
                  <div className="font-medium">6 months</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

const ProfileSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-text-dark">Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileCard />
        <BillingAddressCard />
      </div>
    </section>
  );
};

const SellProductSection: React.FC = () => {
  const { addNotification } = useNotification();
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryOptions = [
    { value: '', label: 'Select category' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'dairy', label: 'Dairy' },
  ];

  const unitOptions = [
    { value: '', label: 'Select unit' },
    { value: 'quintal', label: 'Quintal (100 kg)' },
    { value: 'ton', label: 'Ton (1000 kg)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'bag', label: 'Bag (50 kg)' },
    { value: 'crate', label: 'Crate' },
    { value: 'box', label: 'Box' },
  ];

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 30 seconds to check for status updates
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching farmer requests...');
      const data = await farmerProductRequestService.getMyRequests();
      console.log('Farmer requests received:', data);
      setRequests(data);
    } catch (error: any) {
      console.error('Failed to fetch requests:', error);
      console.error('Error response:', error.response?.data);
      // Only show notification on first load, not on auto-refresh
      if (requests.length === 0) {
        showNotification(error.response?.data?.message || 'Failed to fetch requests', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !category || !quantity || !unit || !price || !image) {
      showNotification('Please fill all fields and upload an image', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await farmerProductRequestService.createRequest({
        productName,
        category,
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(price),
        initialImage: image
      });

      showNotification('Product request submitted successfully!', 'success');
      
      // Reset form
      setProductName('');
      setCategory('');
      setQuantity('');
      setUnit('');
      setPrice('');
      setImage(null);
      setImagePreview('');
      
      // Refresh requests list
      fetchRequests();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await farmerProductRequestService.deleteRequest(id);
      showNotification('Request deleted successfully', 'success');
      fetchRequests();
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to delete request', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-border-color rounded-lg p-8 bg-white">
        <h2 className="text-2xl font-semibold text-text-dark mb-6">Sell Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
            />
            {imagePreview && (
              <div className="mt-3">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-border-color" />
              </div>
            )}
          </div>
          <Dropdown
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            placeholder="Select category"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <Dropdown
              label="Unit"
              options={unitOptions}
              value={unit}
              onChange={setUnit}
              placeholder="Select unit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Price (per unit)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Send Request for Selling'}
          </button>
        </form>
      </div>
      
      <div className="border border-border-color rounded-lg p-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-dark">Request Status</h3>
          <button
            onClick={fetchRequests}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-text-muted">Loading requests...</p>
          </div>
        ) : (
          <ProductRequestTable requests={requests} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
};

const AiModelSection: React.FC = () => {
  const { addNotification } = useNotification();
  const [activeModel, setActiveModel] = useState<'price' | 'crop' | null>(null);
  
  // Price Prediction State
  const [priceFormData, setPriceFormData] = useState({
    ph: '',
    soilType: '',
    previousCrop: '',
    areaHa: '',
    rainfall: '',
    temperature: '',
    month: '',
    district: '',
  });
  const [pricePrediction, setPricePrediction] = useState<any>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');

  // Crop Prediction State
  const [cropFormData, setCropFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    crop: '',
    qualityGrade: '',
    farmersLocation: '',
    seasonMonth: '',
  });
  const [cropPrediction, setCropPrediction] = useState<any>(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropError, setCropError] = useState('');

  const crops = [
    'Tomato', 'Spinach (Palak)', 'Coriander (Kothimbir)', 'Fenugreek Leaves (Methi)',
    'Green Chilies', 'Cucumber', 'Green Peas', 'Beans', 'Cauliflower', 'Cabbage',
    'Brinjal (Eggplant)', 'Ladyfinger (Bhindi / Okra)', 'Bottle Gourd (Dudhi)',
    'Ridge Gourd (Dodka)', 'Bitter Gourd (Karela)', 'Pumpkin', 'Radish (Mula)',
    'Beetroot', 'Carrot', 'Spring Onion'
  ];

  const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Red', 'Black', 'Alluvial', 'Laterite'];
  
  const districts = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Ahmednagar', 'Satara'];
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const qualityGrades = ['A', 'B', 'C', 'D'];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPriceFormData(prev => ({ ...prev, [name]: value }));
    setPriceError('');
  };

  const validatePriceForm = () => {
    const { ph, soilType, previousCrop, areaHa, rainfall, temperature, month, district } = priceFormData;

    if (!ph || parseFloat(ph) < 5.0 || parseFloat(ph) > 8.5) {
      setPriceError('pH should be between 5.0 and 8.5');
      return false;
    }
    if (!soilType) {
      setPriceError('Please select soil type');
      return false;
    }
    if (!previousCrop) {
      setPriceError('Please select previous crop');
      return false;
    }
    if (!areaHa || parseFloat(areaHa) < 0.1 || parseFloat(areaHa) > 10.0) {
      setPriceError('Area should be between 0.1 and 10.0 hectares');
      return false;
    }
    if (!rainfall || parseFloat(rainfall) < 50 || parseFloat(rainfall) > 1500) {
      setPriceError('Rainfall should be between 50 and 1500 mm');
      return false;
    }
    if (!temperature || parseFloat(temperature) < 15 || parseFloat(temperature) > 35) {
      setPriceError('Temperature should be between 15 and 35°C');
      return false;
    }
    if (!month) {
      setPriceError('Please select planting month');
      return false;
    }
    if (!district) {
      setPriceError('Please select district');
      return false;
    }
    return true;
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePriceForm()) return;

    setPriceLoading(true);
    setPriceError('');

    try {
      const response = await fetch('http://localhost:5001/api/predict-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceFormData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Price prediction failed');

      if (data.success) {
        setPricePrediction(data);
        addNotification('Price prediction generated successfully!');
      } else {
        throw new Error(data.error || 'Price prediction failed');
      }
    } catch (err: any) {
      console.error('Price prediction error:', err);
      if (err.message.includes('Failed to fetch')) {
        setPriceError('Backend server is not running!');
      } else {
        setPriceError('Error: ' + err.message);
      }
      addNotification('Price prediction failed');
    } finally {
      setPriceLoading(false);
    }
  };

  const handlePriceReset = () => {
    setPriceFormData({
      ph: '', soilType: '', previousCrop: '', areaHa: '',
      rainfall: '', temperature: '', month: '', district: ''
    });
    setPricePrediction(null);
    setPriceError('');
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCropFormData(prev => ({ ...prev, [name]: value }));
    setCropError('');
  };

  const validateCropForm = () => {
    const { date, crop, qualityGrade, farmersLocation, seasonMonth } = cropFormData;
    if (!date) { setCropError('Please select date'); return false; }
    if (!crop) { setCropError('Please select crop'); return false; }
    if (!qualityGrade) { setCropError('Please select quality grade'); return false; }
    if (!farmersLocation || farmersLocation.trim() === '') { setCropError('Please enter location'); return false; }
    if (!seasonMonth) { setCropError('Please select month'); return false; }
    return true;
  };

  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCropForm()) return;

    setCropLoading(true);
    setCropError('');

    try {
      const response = await fetch('http://localhost:5001/api/predict-next-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: cropFormData.date,
          crop: cropFormData.crop,
          quality_grade: cropFormData.qualityGrade,
          farmers_location: cropFormData.farmersLocation,
          season_month: cropFormData.seasonMonth
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Crop prediction failed');

      if (data.success) {
        setCropPrediction(data);
        addNotification('Crop prediction generated successfully!');
      } else {
        throw new Error(data.error || 'Crop prediction failed');
      }
    } catch (err: any) {
      console.error('Crop prediction error:', err);
      if (err.message.includes('Failed to fetch')) {
        setCropError('Backend server is not running!');
      } else {
        setCropError('Error: ' + err.message);
      }
      addNotification('Crop prediction failed');
    } finally {
      setCropLoading(false);
    }
  };

  const handleCropReset = () => {
    setCropFormData({
      date: new Date().toISOString().split('T')[0],
      crop: '', qualityGrade: '', farmersLocation: '', seasonMonth: ''
    });
    setCropPrediction(null);
    setCropError('');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-dark mb-2">AI Model</h2>
        <p className="text-text-dark-gray text-sm">Predict prices and get crop recommendations using our AI-powered tools</p>
      </div>

      {/* Model Selection Cards */}
      {!activeModel && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Prediction Card */}
          <div 
            onClick={() => setActiveModel('price')}
            className="bg-white border-2 border-border-color rounded-lg p-8 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <svg className="w-10 h-10 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark mb-2 group-hover:text-primary transition-colors">Crop Price Prediction</h3>
                <p className="text-text-muted text-sm">Get AI-powered price predictions for your crops based on soil conditions, weather, and market trends</p>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span>Start Prediction</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Next Crop Prediction Card */}
          <div 
            onClick={() => setActiveModel('crop')}
            className="bg-white border-2 border-border-color rounded-lg p-8 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <svg className="w-10 h-10 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark mb-2 group-hover:text-primary transition-colors">Next Crop Recommendation</h3>
                <p className="text-text-muted text-sm">Discover the best crops to plant next based on your soil quality, location, and seasonal conditions</p>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span>Get Recommendation</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Prediction Form */}
      {activeModel === 'price' && (
        <div className="bg-white border border-border-color rounded-lg p-8">
          <h3 className="text-xl font-semibold text-text-dark mb-2">Crop Price Prediction</h3>
          <p className="text-text-muted text-sm mb-6">Get estimated market prices for your crops</p>
          
          <form onSubmit={handlePriceSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Soil pH *</label>
                <input type="number" name="ph" step="0.1" min="5.0" max="8.5" value={priceFormData.ph} onChange={handlePriceChange} placeholder="5.3 to 8.0" required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                <small className="text-xs text-text-muted">Range: 5.0 - 8.5</small>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Soil Type *</label>
                <select name="soilType" value={priceFormData.soilType} onChange={handlePriceChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                  <option value="">Select Soil Type</option>
                  {soilTypes.map((soil, index) => (<option key={index} value={soil}>{soil}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Previous Crop *</label>
              <select name="previousCrop" value={priceFormData.previousCrop} onChange={handlePriceChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                <option value="">Select previous crop</option>
                {crops.map((crop, index) => (<option key={index} value={crop}>{crop}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Farm Area (hectares) *</label>
                <input type="number" name="areaHa" step="0.1" min="0.1" max="10.0" value={priceFormData.areaHa} onChange={handlePriceChange} placeholder="0.2 to 5.0" required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                <small className="text-xs text-text-muted">Range: 0.1 - 10.0 hectares</small>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Expected Rainfall (mm) *</label>
                <input type="number" name="rainfall" step="10" min="50" max="1500" value={priceFormData.rainfall} onChange={handlePriceChange} placeholder="80 to 1200" required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                <small className="text-xs text-text-muted">Range: 50 - 1500 mm</small>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Average Temperature (°C) *</label>
                <input type="number" name="temperature" step="0.5" min="15" max="35" value={priceFormData.temperature} onChange={handlePriceChange} placeholder="16 to 33" required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                <small className="text-xs text-text-muted">Range: 15 - 35°C</small>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Planting Month *</label>
                <select name="month" value={priceFormData.month} onChange={handlePriceChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                  <option value="">Select month</option>
                  {months.map((month) => (<option key={month} value={month}>{month}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">District *</label>
              <select name="district" value={priceFormData.district} onChange={handlePriceChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                <option value="">Select District</option>
                {districts.map((district, index) => (<option key={index} value={district}>{district}</option>))}
              </select>
            </div>

            {priceError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{priceError}</div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={priceLoading} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {priceLoading ? 'Calculating...' : 'Predict Price'}
              </button>
              <button type="button" onClick={handlePriceReset} className="px-6 bg-gray-100 hover:bg-gray-200 text-text-dark font-semibold py-3 rounded-full transition-colors">Reset</button>
            </div>
          </form>

          {pricePrediction && (
            <div className="mt-6">
              <h4 className="text-base font-semibold text-text-dark mb-4">Price Prediction Result</h4>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 space-y-5">
                <div className="text-center pb-4 border-b border-green-200">
                  <div className="text-sm text-text-muted mb-2">Predicted Modal Price</div>
                  <div className="text-4xl font-bold text-green-600 mb-1">₹ {pricePrediction.predicted_price?.toFixed(2) || '0.00'}</div>
                  <div className="text-sm text-text-muted">per quintal</div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-text-dark">Expected Price Range</div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-center flex-1">
                      <div className="text-xs text-text-muted mb-1">Minimum</div>
                      <div className="text-lg font-bold text-orange-600">₹ {pricePrediction.min_price?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div className="text-2xl text-text-muted">—</div>
                    <div className="text-center flex-1">
                      <div className="text-xs text-text-muted mb-1">Maximum</div>
                      <div className="text-lg font-bold text-green-600">₹ {pricePrediction.max_price?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-green-200">
                  <div className="text-sm"><span className="text-text-muted">Previous Crop:</span><span className="ml-2 font-medium text-text-dark">{priceFormData.previousCrop}</span></div>
                  <div className="text-sm"><span className="text-text-muted">Soil Type:</span><span className="ml-2 font-medium text-text-dark">{priceFormData.soilType}</span></div>
                  <div className="text-sm"><span className="text-text-muted">District:</span><span className="ml-2 font-medium text-text-dark">{priceFormData.district}</span></div>
                  <div className="text-sm"><span className="text-text-muted">Month:</span><span className="ml-2 font-medium text-text-dark">{priceFormData.month}</span></div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700"><strong>Note:</strong> These prices are estimates and may vary based on market conditions.</div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => {
              setActiveModel(null);
              setPricePrediction(null);
              setPriceError('');
              handlePriceReset();
            }}
            className="mt-4 flex items-center gap-2 text-text-dark-gray hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Model Selection</span>
          </button>
        </div>
      )}

      {/* Next Crop Prediction Form */}
      {activeModel === 'crop' && (
        <div className="bg-white border border-border-color rounded-lg p-8">
          <h3 className="text-xl font-semibold text-text-dark mb-2">Next Crop Prediction</h3>
          <p className="text-text-muted text-sm mb-6">Get recommendations for your next crop</p>
          
          <form onSubmit={handleCropSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Date *</label>
              <input type="date" name="date" value={cropFormData.date} onChange={handleCropChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Current/Previous Crop *</label>
              <select name="crop" value={cropFormData.crop} onChange={handleCropChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                <option value="">Select current crop</option>
                {crops.map((crop, index) => (<option key={index} value={crop}>{crop}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Soil Quality Grade *</label>
              <select name="qualityGrade" value={cropFormData.qualityGrade} onChange={handleCropChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                <option value="">Select grade</option>
                {qualityGrades.map((grade) => (<option key={grade} value={grade}>Grade {grade}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Farmer's Location *</label>
              <input type="text" name="farmersLocation" value={cropFormData.farmersLocation} onChange={handleCropChange} placeholder="Enter your village/city" required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Planting Season Month *</label>
              <select name="seasonMonth" value={cropFormData.seasonMonth} onChange={handleCropChange} required className="w-full px-4 py-3 border border-border-color rounded-md text-text-dark-gray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                <option value="">Select month</option>
                {months.map((month) => (<option key={month} value={month}>{month}</option>))}
              </select>
            </div>

            {cropError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{cropError}</div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={cropLoading} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {cropLoading ? 'Calculating...' : 'Predict Crop'}
              </button>
              <button type="button" onClick={handleCropReset} className="px-6 bg-gray-100 hover:bg-gray-200 text-text-dark font-semibold py-3 rounded-full transition-colors">Reset</button>
            </div>
          </form>

          {cropPrediction && (
            <div className="mt-6">
              <h4 className="text-base font-semibold text-text-dark mb-4">Next Crop Recommendation</h4>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 space-y-5">
                <div className="text-center pb-4 border-b border-green-200">
                  <div className="text-sm text-text-muted mb-2">Recommended Next Crop</div>
                  <div className="text-3xl font-bold text-green-600 mb-2">{cropPrediction.recommended_crop || 'N/A'}</div>
                  <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium">Best Match for Your Land</div>
                </div>
                {cropPrediction.confidence && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Confidence Level</span>
                      <span className="text-sm font-bold text-green-600">{cropPrediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${cropPrediction.confidence}%` }}></div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-green-200">
                  <div className="text-sm"><span className="text-text-muted">Previous:</span><span className="ml-2 font-medium text-text-dark">{cropFormData.crop}</span></div>
                  <div className="text-sm"><span className="text-text-muted">Soil Grade:</span><span className="ml-2 font-medium text-text-dark">{cropFormData.qualityGrade}</span></div>
                  <div className="text-sm"><span className="text-text-muted">Location:</span><span className="ml-2 font-medium text-text-dark">{cropFormData.farmersLocation}</span></div>
                  <div className="text-sm"><span className="text-text-muted">Month:</span><span className="ml-2 font-medium text-text-dark">{cropFormData.seasonMonth}</span></div>
                </div>
                {cropPrediction.benefits && (
                  <div className="bg-white border border-green-200 rounded-md p-4 space-y-2">
                    <div className="text-sm font-medium text-text-dark mb-2">Expected Benefits</div>
                    <ul className="space-y-1.5 text-sm text-text-dark-gray">
                      {cropPrediction.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span><span>{benefit}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700"><strong>Note:</strong> This recommendation is based on your land conditions. Please consult agricultural experts.</div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => {
              setActiveModel(null);
              setCropPrediction(null);
              setCropError('');
              handleCropReset();
            }}
            className="mt-4 flex items-center gap-2 text-text-dark-gray hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Model Selection</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-border-color">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center py-4 text-left hover:text-primary transition-colors duration-300"
    >
      <h3 className="text-base font-medium text-text-dark pr-8">{question}</h3>
      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-primary transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
      </span>
    </button>
    <div
      className={`overflow-hidden transition-all duration-700 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100 mb-2' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="pb-4 text-sm text-text-muted leading-relaxed">
        {answer}
      </div>
    </div>
  </div>
);

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData = [
    {
      question: "How do I list a product for sale?",
      answer: "Navigate to the \"Sell Product\" section from the sidebar menu. Fill in the product details including name, category, quantity, unit, and price. Upload a clear image of your product and click \"Send Request for Selling\". Your product will be reviewed and approved within 24-48 hours.",
    },
    {
      question: "How long does the approval process take?",
      answer: "Product approvals typically take 24-48 hours. Our team reviews each submission to ensure quality standards. You'll receive a notification once your product is approved and listed on the marketplace.",
    },
    {
      question: "How can I track my sales and revenue?",
      answer: "Visit the \"Overview\" section to see your comprehensive dashboard with revenue statistics, land area utilization, and monthly yield analysis. You can track all your sales performance and farming metrics in one place.",
    },
    {
      question: "What payment methods are supported?",
      answer: "We support multiple payment methods including bank transfers, UPI, digital wallets, and cash on delivery. Payments are processed securely and funds are transferred to your registered bank account within 2-3 business days after delivery confirmation.",
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to \"Settings\" from the sidebar menu. Here you can update your personal information, contact details, pickup address, and profile photo. Make sure to click \"Save Changes\" after updating any information.",
    },
    {
      question: "How accurate are the AI model predictions?",
      answer: "Our AI models use advanced machine learning algorithms and real-time market data to provide accurate predictions. The price prediction model has an average accuracy of 85-90%, while the crop recommendation system considers soil type, season, and local climate patterns to suggest the most suitable crops for your farm.",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white border border-border-color rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-dark mb-6">Frequently Asked Questions</h3>
      <div>
        {faqData.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </div>
  );
};

const HelpSupportSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-text-dark">Help And Support</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Support Card */}
        <div className="bg-white border border-border-color rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Contact Support</h3>
          <p className="text-text-muted mb-6">Need help? Reach out to our support team. We're here to assist you with any questions or concerns.</p>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text-dark mb-1">Email</p>
              <p className="text-sm text-primary font-medium">support@agroreach.com</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-dark mb-1">Phone</p>
              <p className="text-sm text-text-dark-gray">+1 234 567 8900</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-dark mb-1">Working Hours</p>
              <p className="text-sm text-text-dark-gray">Mon - Fri: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white border border-border-color rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Quick Links</h3>
          <p className="text-text-muted mb-6">Access helpful resources and guides to make the most of your farming experience.</p>
          <div className="space-y-3">
            <a href="#" className="flex items-center justify-between p-3 border border-border-color rounded-lg hover:border-primary transition-colors group">
              <span className="text-sm font-medium text-text-dark">User Guide & Tutorials</span>
              <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#" className="flex items-center justify-between p-3 border border-border-color rounded-lg hover:border-primary transition-colors group">
              <span className="text-sm font-medium text-text-dark">Terms & Conditions</span>
              <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#" className="flex items-center justify-between p-3 border border-border-color rounded-lg hover:border-primary transition-colors group">
              <span className="text-sm font-medium text-text-dark">Privacy Policy</span>
              <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#" className="flex items-center justify-between p-3 border border-border-color rounded-lg hover:border-primary transition-colors group">
              <span className="text-sm font-medium text-text-dark">Community Forum</span>
              <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <FAQSection />
    </div>
  );
};

const SettingsSection: React.FC = () => {
  return (
    <section className="space-y-8">
      <AccountSettingsForm />
      <BillingAddressForm />
    </section>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <div className="bg-white">
      <main>
        <DashboardBanner />
        <div className="container mx-auto px-4 sm:px-6 lg:px-[120px] py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3">
              <DashboardSidebar />
            </aside>
            <div className="lg:col-span-9">
              <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="profile" element={<ProfileSection />} />
                <Route path="sell-product" element={<SellProductSection />} />
                <Route path="ai-model" element={<AiModelSection />} />
                <Route path="help-support" element={<HelpSupportSection />} />
                <Route path="settings" element={<SettingsSection />} />
              </Routes>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
