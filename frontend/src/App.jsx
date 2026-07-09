import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetail from './pages/PropertyDetail';
import BookingPage from './pages/BookingPage';
import BookingConfirmation from './pages/BookingConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import GuestDashboard from './pages/GuestDashboard';
import HostDashboard from './pages/HostDashboard';
import PropertyForm from './pages/PropertyForm';

function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/properties/:id/book" element={
          <ProtectedRoute allowedRoles={['guest']}>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="/booking-confirmation" element={
          <ProtectedRoute allowedRoles={['guest']}>
            <BookingConfirmation />
          </ProtectedRoute>
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
      <Toast />
    </div>
  );
}

export default App;