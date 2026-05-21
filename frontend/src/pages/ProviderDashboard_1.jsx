import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/ProviderDashboard.css';
import logoImage from '../assets/react.svg';
import AdminImage from '../assets/Admin.jpg';

const ProviderDashboard = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch provider's services
        const servicesResponse = await axios.get('http://localhost:5000/api/services/provider', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(servicesResponse.data || []);
        setStats(prev => ({...prev, totalServices: servicesResponse.data?.length || 0}));
        
        // Fetch provider's bookings
        const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/provider', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingsResponse.data || []);
        
        // Calculate stats from bookings
        const active = bookingsResponse.data?.filter(b => b.status === 'scheduled' || b.status === 'in-progress').length || 0;
        const completed = bookingsResponse.data?.filter(b => b.status === 'completed').length || 0;
        const earnings = bookingsResponse.data
          ?.filter(b => b.status === 'completed')
          .reduce((sum, booking) => sum + (booking.service?.price || 0), 0) || 0;
        
        setStats({
          totalServices: servicesResponse.data?.length || 0,
          activeBookings: active,
          completedBookings: completed,
          totalEarnings: earnings
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setError('Failed to load provider dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
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

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted service from state
      setServices(services.filter(service => service._id !== serviceId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalServices: prev.totalServices - 1
      }));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="provider-page-wrapper" style={{ 
        backgroundImage: `url(${AdminImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1
        }}></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {renderProviderNavbar()}
          <div className="loading-container" style={{ color: 'white' }}>Loading provider dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-page-wrapper" style={{ 
        backgroundImage: `url(${AdminImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1
        }}></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          {renderProviderNavbar()}
          <div className="error-container" style={{ color: 'white' }}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-page-wrapper" style={{ 
      backgroundImage: `url(${AdminImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Dark overlay for better readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }}></div>
      
      {/* Content container */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {renderProviderNavbar()}

        <div className="provider-dashboard" style={{ color: 'white' }}>
          <div className="welcome-section">
            <h1>Provider Dashboard</h1>
            <p>Manage your services and bookings</p>
          </div>

          <div className="stats-container">
            <div className="stat-card" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="stat-icon">🛠️</div>
              <div className="stat-content">
                <h3>Total Services</h3>
                <p className="stat-number">{stats.totalServices}</p>
              </div>
            </div>
            
            <div className="stat-card" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Active Bookings</h3>
                <p className="stat-number">{stats.activeBookings}</p>
              </div>
            </div>
            
            <div className="stat-card" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Completed Jobs</h3>
                <p className="stat-number">{stats.completedBookings}</p>
              </div>
            </div>
            
            <div className="stat-card" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Earnings</h3>
                <p className="stat-number">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="section" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
              <div className="section-header">
                <h2>My Services</h2>
                <div className="section-actions">
                  <Link to="/services/add" className="add-button" style={{ backgroundColor: 'rgb(238, 112, 8)', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>Add Service</Link>
                  <Link to="/services" className="view-all" style={{ color: 'rgb(238, 112, 8)', marginLeft: '10px' }}>View All</Link>
                </div>
              </div>
              <div className="services-grid">
                {services.slice(0, 3).map(service => (
                  <div key={service._id} className="service-card" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
                    <div className="service-header">
                      <h3>{service.name}</h3>
                      <span className={`status-badge ${service.isApproved ? 'active' : 'inactive'}`} style={{ 
                        backgroundColor: service.isApproved ? 'rgba(0, 128, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {service.isApproved ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="service-category">{service.category}</p>
                    <p className="service-price">${service.price}</p>
                    <p className="service-description">{service.description}</p>
                    <div className="service-stats">
                      <span>Bookings: {service.bookings || 0}</span>
                    </div>
                    <div className="service-actions">
                      <button 
                        className="delete-service-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service._id);
                        }}
                        style={{ 
                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete Service
                      </button>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="empty-state" style={{ textAlign: 'center', padding: '20px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <p>You haven't added any services yet.</p>
                    <Link to="/services/add" className="add-service-btn" style={{ 
                      display: 'inline-block',
                      backgroundColor: 'rgb(238, 112, 8)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      marginTop: '10px'
                    }}>Add Service</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="section" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '20px' }}>
              <div className="section-header">
                <h2>Recent Bookings</h2>
                <Link to="/bookings" className="view-all" style={{ color: 'rgb(238, 112, 8)' }}>View All</Link>
              </div>
              <div className="bookings-table-container" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="bookings-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Service</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Client</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map(booking => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '12px 15px' }}>{booking.service?.title || 'Unknown Service'}</td>
                        <td style={{ padding: '12px 15px' }}>{booking.seeker?.name || 'Unknown Client'}</td>
                        <td style={{ padding: '12px 15px' }}>{new Date(booking.date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span className={`status-badge ${booking.status}`} style={{ 
                            backgroundColor: 
                              booking.status === 'completed' ? 'rgba(0, 128, 0, 0.7)' : 
                              booking.status === 'scheduled' ? 'rgba(0, 0, 255, 0.7)' :
                              booking.status === 'in-progress' ? 'rgba(255, 165, 0, 0.7)' :
                              'rgba(255, 0, 0, 0.7)',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                          No bookings yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Footer Section */}
          <footer className="footer" style={{ marginTop: '30px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            <div className="footer-content">
              <p>© 2026 ServiceHub. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

















