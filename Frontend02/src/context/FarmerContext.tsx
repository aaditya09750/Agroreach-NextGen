import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { farmerAuthService } from '../services/farmerAuthService';

export interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  location: string;
  landAreaSize: number;
  photo?: string;
  address?: string;
  zipcode?: string;
}

interface FarmerContextType {
  farmer: Farmer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: FormData) => Promise<void>;
  refreshFarmer: () => Promise<void>;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const useFarmer = (): FarmerContextType => {
  const context = useContext(FarmerContext);
  if (!context) {
    throw new Error('useFarmer must be used within a FarmerProvider');
  }
  return context;
};

interface FarmerProviderProps {
  children: ReactNode;
}

export const FarmerProvider: React.FC<FarmerProviderProps> = ({ children }) => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  // Load farmer on mount
  useEffect(() => {
    const loadFarmer = async () => {
      const token = farmerAuthService.getStoredToken();
      const storedFarmer = farmerAuthService.getStoredFarmer();
      
      if (token && storedFarmer) {
        setFarmer(storedFarmer);
      }
      
      setLoading(false);
    };

    loadFarmer();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await farmerAuthService.login({ email, password });
      if (response.success && response.data) {
        setFarmer(response.data);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await farmerAuthService.register(data);
      // Don't automatically log in after registration
      // Farmer must sign in manually
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    farmerAuthService.logout();
    setFarmer(null);
  };

  const updateProfile = async (data: FormData) => {
    try {
      const response = await farmerAuthService.updateProfile(data);
      if (response.success && response.data) {
        setFarmer(response.data);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const refreshFarmer = async () => {
    try {
      const response = await farmerAuthService.getProfile();
      if (response.success && response.data) {
        setFarmer(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh farmer data:', error);
    }
  };

  return (
    <FarmerContext.Provider
      value={{
        farmer,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshFarmer,
      }}
    >
      {children}
    </FarmerContext.Provider>
  );
};
