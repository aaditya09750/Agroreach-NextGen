import React, { useState, useRef, useEffect } from 'react';
import InputField from '../ui/InputField';
import { useFarmer } from '../../context/FarmerContext';
import { Edit2, User } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const AccountSettingsForm: React.FC = () => {
  const { farmer, updateProfile } = useFarmer();
  const [formData, setFormData] = useState({
    name: farmer?.name || '',
    email: farmer?.email || '',
    phone: farmer?.phone || '',
    location: farmer?.location || '',
    landAreaSize: farmer?.landAreaSize?.toString() || '',
    photo: farmer?.photo || '',
    imageFile: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update formData when farmer changes
  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name || '',
        email: farmer.email || '',
        phone: farmer.phone || '',
        location: farmer.location || '',
        landAreaSize: farmer.landAreaSize?.toString() || '',
        photo: farmer.photo || '',
        imageFile: null,
      });
    }
  }, [farmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result as string,
          imageFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('name', formData.name);
      // Email is read-only and should not be updated
      dataToUpdate.append('phone', formData.phone);
      dataToUpdate.append('location', formData.location);
      dataToUpdate.append('landAreaSize', formData.landAreaSize);
      
      if (formData.imageFile) {
        dataToUpdate.append('photo', formData.imageFile);
        console.log('Uploading photo file:', formData.imageFile.name);
      }

      await updateProfile(dataToUpdate);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-border-color rounded-lg">
      <div className="p-6 border-b border-border-color">
        <h3 className="text-xl font-medium text-text-dark">Account Settings</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                {formData.photo ? (
                  <img
                    src={formData.photo.startsWith('data:') ? formData.photo : getImageUrl(formData.photo)}
                    alt="Profile"
                    className="w-36 h-36 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="absolute bottom-2 right-2 bg-white p-2.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="Edit profile image"
                >
                  <Edit2 className="w-5 h-5 text-gray-700" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="Upload profile image"
                />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <InputField 
                label="Full Name"
                name="name" 
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              <InputField 
                label="Email"
                name="email" 
                type="email" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <InputField 
                label="Phone Number"
                name="phone" 
                type="tel" 
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
              <InputField 
                label="Location"
                name="location" 
                placeholder="Enter your location"
                value={formData.location}
                onChange={handleChange}
              />
              <InputField 
                label="Land Area Size (acres)"
                name="landAreaSize" 
                type="number" 
                placeholder="Enter land area size"
                value={formData.landAreaSize}
                onChange={handleChange}
              />
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettingsForm;
