import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FarmerProvider } from './context/FarmerContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/routes/ProtectedRoute';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages - will be created
import HomePage from './pages/farmer/HomePage';
import ContactPage from './pages/farmer/ContactPage';
import SignInPage from './pages/farmer/SignInPage';
import SignUpPage from './pages/farmer/SignUpPage';
import DashboardPage from './pages/farmer/DashboardPage';
import CompleteProductDetailsPage from './pages/farmer/CompleteProductDetailsPage';

// Notification Component
import NotificationToast from './components/ui/NotificationToast';

function App() {
  return (
    <CurrencyProvider>
      <NotificationProvider>
        <FarmerProvider>
          <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <NotificationToast />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                
                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Complete Product Details Page */}
                <Route
                  path="/dashboard/complete-product/:requestId"
                  element={
                    <ProtectedRoute>
                      <CompleteProductDetailsPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 Not Found */}
                <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </FarmerProvider>
    </NotificationProvider>
    </CurrencyProvider>
  );
}

export default App;
