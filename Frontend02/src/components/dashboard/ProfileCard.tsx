import React from 'react';
import { Link } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';
import { User } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const ProfileCard: React.FC = () => {
  const { farmer } = useFarmer();

  return (
    <div className="border border-border-color rounded-lg p-8 h-full flex flex-col items-center text-center">
      {farmer?.photo ? (
        <img
          src={getImageUrl(farmer.photo)}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-14 h-14 text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-medium text-text-dark mt-4">
        {farmer?.name || 'Guest User'}
      </h3>
      <p className="text-sm text-text-muted mt-1">Customer</p>
      <Link 
        to="/dashboard/settings" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
        className="mt-4 text-base font-medium text-primary hover:underline"
      >
        Edit Profile
      </Link>
    </div>
  );
};

export default ProfileCard;
