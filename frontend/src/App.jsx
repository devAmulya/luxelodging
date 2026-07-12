import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const HostDashboard = lazy(() => import('./pages/HostDashboard'));
const PropertyForm = lazy(() => import('./pages/PropertyForm'));

function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Suspense fallback={<p className="text-center py-20 text-muted font-sans">Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/properties/:id/book" element={
            <ProtectedRoute allowedRoles={['guest']}><BookingPage /></ProtectedRoute>
          } />
          <Route path="/booking-confirmation" element={
            <ProtectedRoute allowedRoles={['guest']}><BookingConfirmation /></ProtectedRoute>
          } />
          <Route path="/dashboard/guest" element={
            <ProtectedRoute allowedRoles={['guest']}><GuestDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/host" element={
            <ProtectedRoute allowedRoles={['host']}><HostDashboard /></ProtectedRoute>
          } />
          <Route path="/host/properties/new" element={
            <ProtectedRoute allowedRoles={['host']}><PropertyForm /></ProtectedRoute>
          } />
          <Route path="/host/properties/:id/edit" element={
            <ProtectedRoute allowedRoles={['host']}><PropertyForm /></ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      <Toast />
    </div>
  );
}

export default App;