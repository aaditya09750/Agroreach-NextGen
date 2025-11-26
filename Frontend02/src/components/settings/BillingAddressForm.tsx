import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../ui/InputField';
import { useFarmer } from '../../context/FarmerContext';

const BillingAddressForm: React.FC = () => {
  const { farmer, updateProfile } = useFarmer();
  const [formData, setFormData] = useState({
    address: farmer?.address || '',
    zipcode: farmer?.zipcode || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  // Update formData when farmer changes
  useEffect(() => {
    if (farmer) {
      setFormData({
        address: farmer.address || '',
        zipcode: farmer.zipcode || '',
      });
    }
  }, [farmer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('address', formData.address);
      dataToUpdate.append('zipcode', formData.zipcode);

      await updateProfile(dataToUpdate);
      setMessage({ type: 'success', text: 'Pickup address updated successfully!' });
      
      setTimeout(() => {
        window.scrollTo(0, 0);
        navigate('/dashboard/profile');
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update address. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-border-color rounded-lg">
      <div className="p-6 border-b border-border-color">
        <h3 className="text-xl font-medium text-text-dark">Pickup Address</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <InputField 
              label="Street Address"
              name="address" 
              placeholder="Enter your street address"
              value={formData.address}
              onChange={handleInputChange}
              isTextarea
              rows={3}
            />
            <InputField 
              label="Zip Code"
              name="zipcode" 
              placeholder="Enter your zip code"
              value={formData.zipcode}
              onChange={handleInputChange}
            />
          </div>
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="mt-6 bg-primary text-white font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BillingAddressForm;
