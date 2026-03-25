import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/ServiceDetail.css';
import logoImage from '../assets/react.svg';
import logsigImage from '../assets/logsig.jpg'; // Import logsig image

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

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
        
        // Get user role from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
        
        const res = await axios.get(`http://localhost:5000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setService(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch service details:', err);
        
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (err.response.status === 404) {
            setError('Service not found. It may have been removed or the ID is incorrect.');
          } else if (err.response.status === 400) {
            setError('Invalid service ID format.');
          } else if (err.response.status === 401 || err.response.status === 403) {
            setError('You are not authorized to view this service.');
            // Optionally redirect to login
            // setTimeout(() => navigate('/login'), 2000);
          } else {
            setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response from server. Please check your connection and try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('An unexpected error occurred. Please try again later.');
        }
        
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleBookService = () => {
    navigate(`/booking/${id}`);
  };

  const handleApproveService = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/services/admin/services/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the service state after approval
      setService(prev => ({ ...prev, isApproved: true }));
    } catch (error) {
      console.error('Error approving service:', error);
    }
  };

  const handleRejectService = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/services/admin/services/reject/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the service state after rejection
      setService(prev => ({ ...prev, isApproved: false }));
    } catch (error) {
      console.error('Error rejecting service:', error);
    }
  };

  const handleDeleteService = async () => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/services/${id}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Redirect to services page after deletion
      navigate('/services');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  return (
    <>
      {/* Fixed Header */}
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
      
      <div className="service-detail-container">
        {loading ? (
          <div className="loading-container">Loading service details...</div>
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
          <div className="service-detail-content">
            <div className="service-detail-header">
              <Link to="/services" className="back-button" style={{color: "rgb(238, 112, 8)"}}>
                ← Back to Services
              </Link>
              <div className="service-category-badge" style={{backgroundColor: "rgb(238, 112, 8)"}}>{service.category}</div>
            </div>
            
            <h1 className="service-detail-title" style={{color: "rgb(238, 112, 8)"}} position:centre>{service.title} </h1>
            
            <div className="service-detail-meta">
              <div className="service-price-container">
                <h2 style={{color: "rgb(238, 112, 8)", fontWeight: "600"}}>Price:</h2>
                <span className="service-detail-price">${service.price}</span>
              </div>
              
              <div className="service-provider">
                <span className="provider-label">Provider:</span>
                <span className="provider-name">{service.provider?.name || 'Unknown Provider'}</span>
              </div>
            </div>
            
            <div className="service-detail-section">
              <h2 style={{color: "rgb(238, 112, 8)", borderBottom: "none"}}>Description</h2>
              <p className="service-detail-description">{service.description}</p>
            </div>
            
            {service.availability && service.availability.length > 0 && (
              <div className="service-detail-section">
                <h2 style={{color: "rgb(238, 112, 8)", borderBottom: "none"}}>Availability</h2>
                <div className="availability-list">
                  {service.availability.map((time, index) => (
                    <div key={index} className="availability-item">{time}</div>
                  ))}
                </div>
              </div>
            )}
            
            {service.location && (
              <div className="service-detail-section">
                <h2 style={{color: "rgb(238, 112, 8)", borderBottom: "none"}}>Location</h2>
                <p className="service-location">{service.location}</p>
              </div>
            )}
            
            <div className="service-detail-actions">
              {userRole === 'admin' ? (
                <div className="admin-actions">
                  {!service.isApproved ? (
                    <button 
                      className="approve-service-btn"
                      onClick={handleApproveService}
                    >
                      Approve Service
                    </button>
                  ) : (
                    <button 
                      className="reject-service-btn"
                      onClick={handleRejectService}
                    >
                      Reject Service
                    </button>
                  )}
                  <button 
                    className="delete-service-btn"
                    onClick={handleDeleteService}
                  >
                    Delete Service
                  </button>
                </div>
              ) : (
                <button 
                  className="book-service-btn"
                  onClick={handleBookService}
                >
                  Book This Service
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="not-found-container">
            <h2>Service Not Found</h2>
            <p>The service you're looking for doesn't exist or has been removed.</p>
            <Link to="/services" className="back-to-services">
              Back to Services
            </Link>
          </div>
        )}
        {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2023 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </>
  );
};

export default ServiceDetail;



