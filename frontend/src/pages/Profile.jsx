import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../css/Profile.css';
import logoImage from '../assets/react.svg';
import logsigImage from '../assets/logsig.jpg';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get the user ID from the token
        const decoded = jwtDecode(token);
        console.log("Token decoded:", decoded);
        
        // Then fetch the full user profile from the backend
        try {
          console.log("Fetching user profile...");
          const response = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("Profile response:", response.data);
          const userData = response.data;
          
          setUser({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            phone: userData.phone || '',
            address: userData.address || '',
          });
          
          setFormData({
            name: userData.name,
            phone: userData.phone || '',
            address: userData.address || '',
          });
        } catch (apiError) {
          console.error('API Error:', apiError);
          setError("Couldn't fetch profile from server. Using token data instead.");
          
          // Use token data as fallback
          setUser({
            name: decoded.name || 'User',
            email: decoded.email || 'user@example.com',
            role: decoded.role || 'user',
            phone: decoded.phone || '',
            address: decoded.address || '',
          });
          
          setFormData({
            name: decoded.name || 'User',
            phone: decoded.phone || '',
            address: decoded.address || '',
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError("Invalid token. Please log in again.");
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      setError(null);
      
      // Update the profile on the backend
      try {
        const response = await axios.put('http://localhost:5000/api/users/profile', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state with the response data
        setUser({
          ...user,
          name: response.data.name || formData.name,
          phone: response.data.phone || formData.phone,
          address: response.data.address || formData.address,
        });
        
        alert('Profile updated successfully!');
      } catch (apiError) {
        console.error('API Error:', apiError);
        setError("Couldn't update profile on server. Updated locally only.");
        
        // Fallback: update local state even if API fails
        setUser({
          ...user,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError("An unexpected error occurred.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Loading state JSX
  if (loading) {
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
        <div className="loading-container">Loading profile...</div>
      </>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* Navbar */}
      <header className="main-header">
        <Link to="/" className="header-logo">
          <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
          <span>ServiceHub</span>
        </Link>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/services">Services</Link>
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="profile-content-area">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your account information</p>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="profile-card">
            <div className="profile-info">
              <div className="profile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              {!isEditing ? (
                <div className="profile-details">
                  <h2>{user.name}</h2>
                  <p className="user-email">{user.email}</p>
                  <div className="role-badge">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                  
                  {user.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{user.address}</span>
                    </div>
                  )}
                  
                  <button 
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form className="edit-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="save-button">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2023 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;



