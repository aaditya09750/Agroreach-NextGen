import React from 'react';
import { Link } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';

const BillingAddressCard: React.FC = () => {
  const { farmer } = useFarmer();

  return (
    <div className="border border-border-color rounded-lg p-8 h-full">
      <p className="text-sm font-medium text-text-nav uppercase tracking-wider">PICKUP ADDRESS</p>
      <div className="mt-4 space-y-2 text-text-dark-gray">
        {farmer?.address ? (
          <>
            <p className="text-lg font-medium text-text-dark">
              {farmer.name}
            </p>
            <p className="text-base">
              {farmer.address}
              {farmer.location && `, ${farmer.location}`}
              {farmer.zipcode && ` ${farmer.zipcode}`}
            </p>
            {farmer.email && (
              <p className="text-base text-text-dark">{farmer.email}</p>
            )}
            {farmer.phone && (
              <p className="text-base text-text-dark">{farmer.phone}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">No pickup address added yet</p>
        )}
      </div>
      <Link 
        to="/dashboard/settings" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
        className="mt-6 inline-block text-base font-medium text-primary hover:underline"
      >
        {farmer?.address ? 'Edit Address' : 'Add Address'}
      </Link>
    </div>
  );
};

export default BillingAddressCard;
