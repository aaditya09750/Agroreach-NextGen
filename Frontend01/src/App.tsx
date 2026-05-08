import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import './i18n/config';
import { authService } from './services/authService';
import HomePage from './pages/user/HomePage';
import ShopPage from './pages/user/ShopPage';
import ContactPage from './pages/user/ContactPage';
import AboutPage from './pages/user/AboutPage';
import SignInPage from './pages/user/SignInPage';
import SignUpPage from './pages/user/SignUpPage';
import LogoutPage from './pages/user/LogoutPage';
import CartPage from './pages/user/CartPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { OrderProvider } from './context/OrderContext';
import { NotificationProvider } from './context/NotificationContext';
import CartNotification from './components/ui/CartNotification';
import UserNotification from './components/ui/UserNotification';
import OrderNotification from './components/ui/OrderNotification';
import SkeletonLoader from './components/ui/SkeletonLoader';
import Chatbot from './components/chatbot/Chatbot';

// Lazy-load heavier / less-frequently-visited pages so customers don't pay
// to download the admin or order code on first load.
const DashboardPage = lazy(() => import('./pages/user/DashboardPage'));
const OrderHistoryPage = lazy(() => import('./pages/user/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'));
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.migrateOldStorage();
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <CurrencyProvider>
      <LanguageProvider>
        <UserProvider>
          <NotificationProvider>
            <ProductProvider>
              <CartProvider>
                <OrderProvider>
                  <Router>
                    <CartNotification />
                    <UserNotification />
                    <OrderNotification />
                    <Suspense fallback={<SkeletonLoader />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/logout" element={<LogoutPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/order-history" element={
                          <ProtectedRoute>
                            <OrderHistoryPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/dashboard/order/:orderId" element={
                          <ProtectedRoute>
                            <OrderDetailPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin" element={<AdminLoginPage />} />
                        <Route path="/admin/dashboard" element={
                          <ProtectedRoute adminOnly>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </Suspense>
                  </Router>
                </OrderProvider>
              </CartProvider>
            </ProductProvider>
          </NotificationProvider>
        </UserProvider>
      </LanguageProvider>
      <Chatbot />
    </CurrencyProvider>
  );
}

export default App;
