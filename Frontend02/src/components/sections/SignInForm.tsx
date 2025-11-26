import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useFarmer();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Check for success message from registration
  React.useEffect(() => {
    const locationState = location.state as { message?: string } | null;
    if (locationState?.message) {
      setSuccessMessage(locationState.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formState.email, formState.password);
      
      // Redirect to the page they tried to visit or dashboard
      const locationState = location.state as { from?: { pathname?: string } } | null;
      const from = locationState?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 w-full max-w-[520px]">
      <h2 className="text-3xl font-semibold text-text-dark text-center">Sign In</h2>
      
      {successMessage && (
        <div className="mt-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formState.email}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            required
          />
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formState.password}
            onChange={handleChange}
            className="w-full px-4 py-3.5 border border-border-color rounded-md text-text-dark-gray placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted"
            aria-label="Toggle password visibility"
          >
            <Eye size={20} />
          </button>
        </div>
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formState.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-text-dark-gray">Remember me</span>
          </label>
          <Link to="/signin" className="text-text-dark-gray hover:text-primary">Forgot Password?</Link>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white font-semibold py-3.5 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-5 text-center text-sm">
        <span className="text-text-dark-gray">Don't have an account?</span>
        <Link to="/signup" className="text-text-dark font-medium hover:text-primary"> Sign Up</Link>
      </div>
    </div>
  );
};

export default SignInForm;
