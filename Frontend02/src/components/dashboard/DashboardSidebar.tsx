import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, ShoppingBag, Brain, HelpCircle, Settings, LogOut } from 'lucide-react';
import { useFarmer } from '../../context/FarmerContext';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 px-5 py-4 rounded-md transition-colors relative ${
        isActive ? 'bg-primary-light' : 'hover:bg-gray-100'
      }`}
    >
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>}
      <span className={isActive ? 'text-primary' : 'text-gray-400'}>
        {icon}
      </span>
      <span className={`font-medium text-base ${isActive ? 'text-text-dark' : 'text-text-dark-gray'}`}>
        {label}
      </span>
    </Link>
  );
};

const DashboardSidebar: React.FC = () => {
  const { logout } = useFarmer();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: <Home size={20} /> },
    { to: '/dashboard/profile', label: 'Profile', icon: <User size={20} /> },
    { to: '/dashboard/sell-product', label: 'Sell Product', icon: <ShoppingBag size={20} /> },
    { to: '/dashboard/ai-model', label: 'AI Model', icon: <Brain size={20} /> },
    { to: '/dashboard/help-support', label: 'Help And Support', icon: <HelpCircle size={20} /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="border border-border-color rounded-lg p-2">
      <div className="px-5 py-4 border-b border-border-color">
        <h3 className="text-xl font-medium text-text-dark">Navigation</h3>
      </div>
      <nav className="p-3 space-y-1">
        {navLinks.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-5 py-4 rounded-md transition-colors hover:bg-gray-100 text-text-dark-gray w-full text-left"
        >
          <LogOut size={20} className="text-gray-400" />
          <span className="font-medium text-base">Log-out</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
