import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Eagerly loaded (public, critical path)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';

// Lazy-loaded (private / less critical)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const TicketsPage = lazy(() => import('./pages/TicketsPage'));

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen bg-base-100">
          <Navbar />

          <Suspense fallback={<LoadingSpinner fullPage />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/services" element={<ServicesPage />} />

              {/* Private routes */}
              <Route path="/dashboard" element={
                <PrivateRoute><DashboardPage /></PrivateRoute>
              } />
              <Route path="/book" element={
                <PrivateRoute><BookingPage /></PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute><ProfilePage /></PrivateRoute>
              } />
              <Route path="/notifications" element={
                <PrivateRoute><NotificationsPage /></PrivateRoute>
              } />
              <Route path="/tickets" element={
                <PrivateRoute><TicketsPage /></PrivateRoute>
              } />

              {/* Admin only routes */}
              <Route path="/admin" element={
                <AdminRoute><AdminDashboard /></AdminRoute>
              } />

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--fallback-b1, oklch(var(--b1)))',
                color: 'var(--fallback-bc, oklch(var(--bc)))',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid var(--fallback-b3, oklch(var(--b3)))',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
