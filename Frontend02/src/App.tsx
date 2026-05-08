import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { FarmerProvider } from './context/FarmerContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/routes/ProtectedRoute';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Always-visited pages stay eager
import HomePage from './pages/farmer/HomePage';
import ContactPage from './pages/farmer/ContactPage';
import SignInPage from './pages/farmer/SignInPage';
import SignUpPage from './pages/farmer/SignUpPage';

// Heavy / less-frequent pages — lazy loaded
const DashboardPage = lazy(() => import('./pages/farmer/DashboardPage'));
const CompleteProductDetailsPage = lazy(() => import('./pages/farmer/CompleteProductDetailsPage'));

import NotificationToast from './components/ui/NotificationToast';
import Chatbot from './components/chatbot/Chatbot';

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center text-text-muted">
    Loading…
  </div>
);

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
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignUpPage />} />

                    <Route
                      path="/dashboard/*"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/complete-product/:requestId"
                      element={
                        <ProtectedRoute>
                          <CompleteProductDetailsPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="*"
                      element={
                        <div className="min-h-screen flex items-center justify-center">
                          <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
                        </div>
                      }
                    />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </FarmerProvider>
      </NotificationProvider>
      <Chatbot />
    </CurrencyProvider>
  );
}

export default App;
