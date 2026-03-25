import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Service.css';
import logoImage from '../assets/react.svg';
import servicesImage from '../assets/services.jpg';

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        // If no token, redirect to login
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await axios.get('http://localhost:5000/api/services/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setServices(res.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(res.data.map(service => service.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError('Failed to load services. Please try again later.');
        setLoading(false);
      }
    };

    fetchServices();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const handleApproveService = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/services/admin/services/approve/${serviceId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the services list after approval
      setServices(prev => 
        prev.map(service => 
          service._id === serviceId ? { ...service, isApproved: true } : service
        )
      );
    } catch (error) {
      console.error('Error approving service:', error);
    }
  };

  const handleRejectService = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/services/admin/services/reject/${serviceId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the services list after rejection
      setServices(prev => 
        prev.map(service => 
          service._id === serviceId ? { ...service, isApproved: false } : service
        )
      );
    } catch (error) {
      console.error('Error rejecting service:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/services/${serviceId}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted service from the list
      setServices(prev => prev.filter(service => service._id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  return (
    <div className="container" style={{ backgroundImage: `url(${servicesImage})` }}>
      {/* Semi-transparent overlay for better readability */}
      <div className="container-overlay"></div>
      
      {/* Header Section */}
      <header className="header">  
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
            <span>ServiceHub</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="services-container">
        <header className="services-header" style={{ backgroundImage: `url(${servicesImage})` }}>
          {/* Semi-transparent overlay for header */}
          <div className="services-header-overlay"></div>
          <h1>Our Available Services</h1>
          <p>Find a variety of services that cater to your needs</p>
        </header>

        {loading ? (
          <div className="loading-container">Loading services...</div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            <div className="category-filter">
              <button 
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategorySelect('all')}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button 
                  key={category} 
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <section className="services-list" style={{
              background: `url(${servicesImage}) no-repeat center center`,
              backgroundSize: 'cover',
              position: 'relative',
              padding: '3rem',
              maxWidth: '100%',
              margin: '0 auto',
              width: '100%',
            }}>
              {/* Semi-transparent overlay for services list */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.85)',
                zIndex: -1,
              }}></div>
              <h2 style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                {selectedCategory === 'all' ? 'All Services' : selectedCategory}
              </h2>
              {filteredServices.length === 0 ? (
                <p className="no-services">No services available in this category.</p>
              ) : (
                <div className="services-grid">
                  {filteredServices.map((service) => (
                    <div key={service._id} className="service-card" onClick={() => navigate(`/services/${service._id}`)}>
                      <h3 className="service-title">{service.title}</h3>
                      <p className="service-category">{service.category}</p>
                      <p className="service-price">${service.price}</p>
                      {userRole === 'admin' && (
                        <div className="admin-actions">
                          {!service.isApproved ? (
                            <button 
                              className="approve-button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveService(service._id);
                              }}
                            >
                              Approve
                            </button>
                          ) : (
                            <button 
                              className="reject-button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectService(service._id);
                              }}
                            >
                              Reject
                            </button>
                          )}
                          <button 
                            className="delete-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteService(service._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      <p className="service-description-preview">
                        {service.description.length > 100 
                          ? `${service.description.substring(0, 100)}...` 
                          : service.description}
                      </p>
                      <button className="view-details-btn">View Details</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        {/* Footer Section */}
        <footer className="footer">
          <div className="footer-content">
            <p>© 2023 ServiceHub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Services;
