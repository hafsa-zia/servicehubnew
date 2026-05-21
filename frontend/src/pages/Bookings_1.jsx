import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Bookings.css';
import logoImage from '../assets/react.svg';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await axios.get('http://localhost:5000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookings(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError('You are not authorized to view bookings.');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/login'), 2000);
          } else {
            setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
          }
        } else if (err.request) {
          setError('No response from server. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
        
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}/seeker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the cancelled booking from state
      setBookings(bookings.filter(booking => booking._id !== bookingId));
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      {/* Navbar */}
      <header className="main-header">
       <Link to="/" className="header-logo">
                         <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
                         <span>ServiceHub</span>
                       </Link>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/services">Services</Link>
          <Link to="/profile">Profile</Link>
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="bookings-container">
        <h1 className="bookings-title">My Bookings</h1>
        
        {loading ? (
          <div className="loading-container">Loading your bookings...</div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setLoading(true);
                setError(null);
                // Force refresh the data
                setTimeout(() => window.location.reload(), 100);
              }}
            >
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You don't have any bookings yet.</p>
            <Link to="/services" className="browse-services-btn">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h2 className="service-title">{booking.service?.title || 'Unknown Service'}</h2>
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="booking-details">
                  <div className="booking-info">
                    <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                    <p><strong>Time:</strong> {booking.time}</p>
                    <p><strong>Provider:</strong> {booking.service?.provider?.name || 'Unknown Provider'}</p>
                    {booking.package && (
                      <div className="package-info">
                        <p><strong>Package:</strong> {booking.package.name}</p>
                        <p><strong>Price:</strong> ${booking.package.finalPrice}</p>
                      </div>
                    )}
                    {!booking.package && (
                      <p><strong>Price:</strong> ${booking.service?.price || 'N/A'}</p>
                    )}
                  </div>
                  
                  <div className="booking-actions">
                    {booking.status !== 'completed' && (
                      <button 
                        className="cancel-booking-btn"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                    <Link 
                      to={`/services/${booking.service?._id}`} 
                      className="view-service-btn"
                    >
                      View Service
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}{/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Bookings;

