import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, ChevronDown, Phone } from 'lucide-react';
import { BsPersonCircle } from "react-icons/bs";
import ARLogo from '../../assets/ARLogo.png';
import { useFarmer } from '../../context/FarmerContext';

const CurrencyDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCurrency = (selectedCurrency: 'USD' | 'INR') => {
    setCurrency(selectedCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currency}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-border-color rounded-md shadow-lg py-1 min-w-[80px] z-[100]">
          <button
            onClick={() => handleSelectCurrency('INR')}
            className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors ${
              currency === 'INR' ? 'text-primary font-medium' : 'text-text-dark-gray'
            }`}
          >
            INR
          </button>
          <button
            onClick={() => handleSelectCurrency('USD')}
            className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors ${
              currency === 'USD' ? 'text-primary font-medium' : 'text-text-dark-gray'
            }`}
          >
            USD
          </button>
        </div>
      )}
    </div>
  );
};

const TopBar: React.FC = () => {
  const { farmer } = useFarmer();
  const address = 'Ambegaon - 410503, Pune, Maharashtra, India';

  return (
    <div className="hidden lg:block border-b border-border-color relative z-[60]">
      <div className="container mx-auto px-8 flex justify-between items-center py-2 text-xs text-text-dark-gray">
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span>Store Location: {address}</span>
        </div>
        <div className="flex items-center gap-4">
          <CurrencyDropdown />
          {!farmer && (
            <>
              <div className="border-l border-border-color h-3"></div>
              <div className="flex items-center gap-1">
                <Link to="/signin" className="hover:text-primary">Sign In</Link>
                <span>/</span>
                <Link to="/signup" className="hover:text-primary">Sign Up</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MidBar: React.FC = () => {
  const { farmer } = useFarmer();

  return (
  <div className="sticky top-0 z-50 bg-white shadow-sm">
    <div className="container mx-auto px-8 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <img src={ARLogo} alt="AR Logo" className="h-8 w-8 object-contain" />
        <span className="text-2xl font-semibold text-text-dark -tracking-[0.02em]">AgroReach NextGen</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {farmer && (
            <span className="text-sm font-medium text-text-dark hidden lg:block">
              Hi {farmer.name.split(' ')[0]}
            </span>
          )}
          <BsPersonCircle size={22} className="text-text-dark" />
        </Link>
      </div>
    </div>
  </div>
);
};

const NavBar: React.FC = () => {
    const { pathname } = useLocation();
    const phoneNumber = '+91 84335 09521';

    return (
        <div className="bg-gray-800 border-t border-gray-700">
            <div className="container mx-auto px-8 flex justify-between items-center text-sm">
                <nav className="hidden lg:flex items-center gap-8">
                    <Link to="/" className={`py-3.5 font-medium transition-colors ${pathname === '/' ? 'text-white' : 'text-gray-300 hover:text-primary'}`}>
                        Home
                    </Link>
                    <Link to="/contact" className={`py-3.5 transition-colors ${pathname === '/contact' ? 'text-white font-medium' : 'text-gray-300 hover:text-primary'}`}>
                        Contact Us
                    </Link>
                    <Link to="/dashboard" className={`py-3.5 transition-colors ${pathname.startsWith('/dashboard') ? 'text-white' : 'text-gray-300 hover:text-primary'}`}>
                        Dashboard
                    </Link>
                </nav>
                <div className="flex items-center gap-2 text-gray-300 font-medium">
                    <Phone size={18} />
                    <span>{phoneNumber}</span>
                </div>
            </div>
        </div>
    );
};

const Header: React.FC = () => {
  return (
    <header className="font-poppins">
      <TopBar />
      <MidBar />
      <NavBar />
    </header>
  );
};

export default Header;
