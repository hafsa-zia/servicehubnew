import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import Services from './pages/Services';
import Profile from './pages/Profile';
import AddService from './pages/AddService';
import ServiceDetail from './pages/ServiceDetail';
import BookingForm from './pages/BookingForm';
import ProviderBookings from './pages/ProviderBookings';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setUserRole(null);
      }
    }
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={
            userRole === 'admin' ? <AdminDashboard /> : 
            userRole === 'provider' ? <ProviderDashboard /> : 
            <Dashboard />
          } 
        />
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Provider routes */}
        <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/services/add" element={<AddService />} />
        
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/booking/:id" element={<BookingForm />} />
        <Route path="/bookings" element={<ProviderBookings />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
          }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Go Home
            </button>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;











