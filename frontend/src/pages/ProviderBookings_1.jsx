import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/ProviderDashboard.css';
import logoImage from '../assets/react.svg';
import AdminImage from '../assets/Admin.jpg';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/');
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/bookings/provider', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching provider bookings:', err);
        setError('Failed to load bookings. Please try again.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };

  const renderProviderNavbar = () => (
    <header className="main-header">
      <Link to="/" className="header-logo">
        <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
        <span>ServiceHub</span>
      </Link>
      <nav className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/services">My Services</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/profile">Profile</Link>
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </header>
  );

  return (
    <div className="provider-bookings-page">
      {renderProviderNavbar()}

      <div className="provider-dashboard">
        <div className="welcome-section">
          <h1>My Bookings</h1>
          <p>Manage all your service bookings</p>
        </div>

        {loading ? (
          <div className="loading-container">Loading bookings...</div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="section">
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map(booking => (
                      <tr key={booking._id}>
                        <td>{booking.service?.title || 'Unknown Service'}</td>
                        <td>{booking.seeker?.name || 'Unknown Client'}</td>
                        <td>{new Date(booking.date).toLocaleDateString()}</td>
                        <td>{booking.time}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="view-details-btn"
                            onClick={() => viewBookingDetails(booking)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="close-modal" onClick={closeBookingDetails}>×</button>
            </div>
            <div className="modal-body">
              <h3 className="section-title">Service Information</h3>
              <p><strong>Service:</strong> {selectedBooking.service?.title || 'Unknown Service'}</p>
              <p><strong>Category:</strong> {selectedBooking.service?.category || 'N/A'}</p>
              <p><strong>Price:</strong> ${selectedBooking.service?.price || 'N/A'}</p>
              
              <h3 className="section-title">Client Information</h3>
              <p><strong>Name:</strong> {selectedBooking.seeker?.name || 'Unknown'}</p>
              <p><strong>Email:</strong> {selectedBooking.seeker?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedBooking.seeker?.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedBooking.seeker?.address || 'N/A'}</p>
              
              <h3 className="section-title">Booking Details</h3>
              <p><strong>Date:</strong> {new Date(selectedBooking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedBooking.time}</p>
              <p><strong>Status:</strong> <span className={`status-text ${selectedBooking.status}`}>{selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}</span></p>
              {selectedBooking.notes && (
                <p><strong>Notes:</strong> {selectedBooking.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProviderBookings;

