import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/AddService.css';
import logoImage from '../assets/react.svg';
import AdminImage from '../assets/Admin.jpg';

const AddService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    availability: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityInput, setAvailabilityInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddAvailability = () => {
    if (availabilityInput.trim()) {
      setFormData({
        ...formData,
        availability: [...formData.availability, availabilityInput.trim()]
      });
      setAvailabilityInput('');
    }
  };

  const handleRemoveAvailability = (index) => {
    const newAvailability = [...formData.availability];
    newAvailability.splice(index, 1);
    setFormData({
      ...formData,
      availability: newAvailability
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Convert price to number
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      await axios.post('http://localhost:5000/api/services', serviceData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLoading(false);
      navigate('/services');
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err.response?.data?.message || 'Failed to add service');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      backgroundImage: `url(${AdminImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      {/* Semi-transparent overlay for better readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 0
      }}></div>
      
      {/* Header Section */}
      <header className="header" style={{ position: 'relative', zIndex: 1 }}>  
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
            <span>ServiceHub</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/services">Services</Link>
            <Link to="/profile">Profile</Link>
          </nav>
            <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <div className="add-service-container" style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h1>Add New Service</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-group">
            <label htmlFor="title">Service Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Home Maintenance">Home Maintenance</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Gardening">Gardening</option>
              <option value="Moving">Moving</option>
              <option value="IT Services">IT Services</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Availability</label>
            <div className="availability-input">
              <input
                type="text"
                value={availabilityInput}
                onChange={(e) => setAvailabilityInput(e.target.value)}
                placeholder="e.g., Monday 9AM-5PM"
              />
              <button 
                type="button" 
                onClick={handleAddAvailability}
                className="add-availability-btn"
              >
                Add
              </button>
            </div>
            
            {formData.availability.length > 0 && (
              <div className="availability-tags">
                {formData.availability.map((time, index) => (
                  <div key={index} className="availability-tag">
                    {time}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveAvailability(index)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/services')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
      
      <footer className="footer" style={{ position: 'relative', zIndex: 1 }}>
        <div className="footer-content">
          <p>© 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AddService;


