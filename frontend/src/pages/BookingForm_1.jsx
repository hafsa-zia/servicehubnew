import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/BookingForm.css';
import logoImage from '../assets/react.svg';
import AdminImage from '../assets/Admin.jpg';
// Import calendar icon
// import { FaCalendarAlt } from 'react-icons/fa';

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    packageIndex: null
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await axios.get(`http://localhost:5000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setService(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch service details:', err);
        
        if (err.response) {
          if (err.response.status === 404) {
            setError('Service not found. It may have been removed or the ID is incorrect.');
          } else if (err.response.status === 401 || err.response.status === 403) {
            setError('You are not authorized to book this service.');
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

    fetchServiceDetail();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePackageSelect = (index) => {
    setFormData({
      ...formData,
      packageIndex: formData.packageIndex === index ? null : index
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const bookingData = {
        service: id,
        date: formData.date,
        time: formData.time,
        packageIndex: formData.packageIndex
      };
      
      await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubmitSuccess(true);
      setSubmitLoading(false);
      
      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      console.error('Failed to book service:', err);
      
      if (err.response) {
        setSubmitError(err.response.data.message || 'Failed to book service');
      } else if (err.request) {
        setSubmitError('No response from server. Please check your connection and try again.');
      } else {
        setSubmitError('An unexpected error occurred. Please try again later.');
      }
      
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="booking-form-page" style={{ backgroundImage: `url(${AdminImage})` }}>
      {/* Navbar */}
      <header className="main-header">
        <div className="header-content">
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
        </div>
      </header>

      <div className="booking-form-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading service details...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <div className="error-actions">
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
              <Link to="/services" className="back-to-services-btn">
                Back to Services
              </Link>
            </div>
          </div>
        ) : service ? (
          <div className="booking-form-content">
            <div className="booking-form-header">
              <Link to={`/services/${id}`} className="back-button">
                ← Back to Service Details
              </Link>
            </div>
            
            <h1 className="booking-form-title">Book Service</h1>
            <div className="service-summary">
              <h2>{service.title}</h2>
              <div className="service-meta">
                <span className="service-price">${service.price}</span>
                <span className="service-provider">Provider: {service.provider?.name || 'Unknown Provider'}</span>
              </div>
            </div>
            
            {submitSuccess ? (
              <div className="success-message">
                <h3>Booking Successful!</h3>
                <p>Your booking has been confirmed.</p>
                <div className="success-actions">
                  <button 
                    className="view-bookings-btn"
                    onClick={() => navigate('/bookings')}
                  >
                    View My Bookings
                  </button>
                  <button 
                    className="back-to-services-btn"
                    onClick={() => navigate('/services')}
                  >
                    Browse More Services
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="booking-form">
                {submitError && <div className="error-message">{submitError}</div>}
                
                <div className="form-group">
                  <label htmlFor="date">Select Date</label>
                  <div className="date-input-container">
                    <div className="calendar-icon" />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="time">Select Time</label>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a time</option>
                    {service.availability && service.availability.map((time, index) => (
                      <option key={index} value={time}>{time}</option>
                    ))}
                    {(!service.availability || service.availability.length === 0) && (
                      <>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </>
                    )}
                  </select>
                </div>
                
                {service.packages && service.packages.length > 0 && (
                  <div className="form-group">
                    <label>Select Package (Optional)</label>
                    <div className="packages-list">
                      {service.packages.map((pkg, index) => (
                        <div 
                          key={index} 
                          className={`package-item ${formData.packageIndex === index ? 'selected' : ''}`}
                          onClick={() => handlePackageSelect(index)}
                        >
                          <h3>{pkg.name}</h3>
                          <p>Duration: {pkg.duration}</p>
                          <p>Visits: {pkg.visitsIncluded}</p>
                          <p>Discount: {pkg.discountPercent}%</p>
                          <p className="package-price">${pkg.finalPrice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-booking-btn"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="not-found-container">
            <h2>Service Not Found</h2>
            <p>The service you're trying to book doesn't exist or has been removed.</p>
            <Link to="/services" className="back-to-services">
              Back to Services
            </Link>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BookingForm;



