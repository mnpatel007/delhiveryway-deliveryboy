import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { LocationProvider } from './context/LocationContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import EarningsPage from './pages/EarningsPage';
import ProfilePage from './pages/ProfilePage';
import OrderDetailsPage from './pages/OrderDetailsPage';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationHandler from './components/NotificationHandler';
import LocationButton from './components/LocationButton';

// Styles
import './App.css';
import './styles/mobile.css';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  const hideNavbarPaths = ['/login', '/signup'];
  const shouldShowNavbar = isAuthenticated && !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="app">
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? 'main-content with-navbar' : 'main-content'}>
        {children}
      </main>
      {shouldShowNavbar && <LocationButton />}
    </div>
  );
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <PrivateRoute>
            <OrderDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/earnings"
        element={
          <PrivateRoute>
            <EarningsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LocationProvider>
          <SocketProvider>
            <DeliveryProvider>
              <Layout>
                <NotificationHandler />
                <AppRoutes />
              </Layout>
            </DeliveryProvider>
          </SocketProvider>
        </LocationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;