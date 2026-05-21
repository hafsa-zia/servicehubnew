import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Dashboard.css';
import logoImage from '../assets/react.svg';
import AdminImage from '../assets/Admin.jpg';

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    const fetchData = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setServices([
            { id: 1, name: 'Plumbing', icon: '🚰', description: 'Fix leaks, install fixtures, and more' },
            { id: 2, name: 'Electrical', icon: '💡', description: 'Wiring, outlets, lighting installations' },
            { id: 3, name: 'HVAC', icon: '❄️', description: 'Heating, ventilation, and air conditioning' },
            { id: 4, name: 'Cleaning', icon: '🧹', description: 'Professional home and office cleaning' },
            { id: 5, name: 'Moving', icon: '📦', description: 'Relocation and moving services' },
            { id: 6, name: 'Pest Control', icon: '🐜', description: 'Eliminate pests from your property' },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching services:', error);
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="dashboard-page-wrapper">
      {/* Header Section */}
      <header className="main-header">  
        <Link to="/" className="header-logo">
          <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
          <span>ServiceHub</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/profile">Profile</Link>
          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Dashboard Content */}
      <div className="dashboard-content-area">
        <div className="dashboard-main">
          <section className="dashboard-section hero-section">
            <h1>Find Trusted Service Providers Near You</h1>
            <p className="subtitle">
              From emergency repairs to scheduled maintenance, SERVICE HUB connects you with verified professionals for all your needs.
            </p> 
            <Link to="/services">
              <button className="primary-button">Find Services</button>
            </Link>
          </section>

          <section className="dashboard-section how-it-works-section">
            <h2>How It Works</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Select a Service</h3>
                <p>Choose from our wide range of professional services</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Book an Appointment</h3>
                <p>Pick a time that works best for you</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Get It Done</h3>
                <p>Relax while our professionals handle the job</p>
              </div>
            </div>
          </section>

          <section className="dashboard-section popular-services-section">
            <h2>Popular Services</h2>
            {loading ? (
              <div className="loading-spinner">Loading services...</div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <div key={service.id} className="service-card">
                    <div className="service-icon">{service.icon}</div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <button className="secondary-button">Book Now</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
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

export default Dashboard;
