import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import '../css/Signup.css';
import logoImage from '../assets/react.svg';
import LogsigImage from '../assets/logsig.jpg';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'seeker'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting signup data:', {
        ...formData,
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]'
      });

      // Create data object without confirmPassword and phone (making phone optional)
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        signupData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('Signup response:', response.data);
      setSuccess('Signup successful! You can log in now.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'seeker'
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        setError(error.response.data.message || 'Signup failed');
        
        if (error.response.data.errors) {
          setError(`Validation errors: ${error.response.data.errors.join(', ')}`);
        }
      } else if (error.request) {
        console.log('Error request:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth signup
  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google credential decoded:', decoded);

      axios
        .post('http://localhost:5000/api/auth/google-login', {
          token: credentialResponse.credential
        })
        .then((res) => {
          localStorage.setItem('token', res.data.token);
          alert('Google signup successful!');
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Google signup error:', err);
          setError(err.response?.data?.message || 'Google signup failed');
        });
    } catch (error) {
      console.error('Failed to decode Google token:', error);
      setError('Invalid Google token');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Please try again.');
  };

  return (
    <div className="container" style={{
      background: `url(${LogsigImage}) no-repeat center center`,
      backgroundSize: 'cover',
    }}>
      {/* Semi-transparent overlay for better readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}></div>
      
      {/* Header Section */}
      <header className="header">  
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
            <span>ServiceHub</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
          </nav>
          <div className="auth-buttons">
            <a href="/login" className="login-btn">Login</a>
          </div>
        </div>
      </header>

      {/* Main Content with fixed height and scrolling */}
      <div className="main-content">
        {/* Signup Form with fixed container */}
        <div className="signup-container">
          <div className="signup-box">
            <div className="signup-header">
              <h2>Signup</h2>
              <p>Enter your details to create your account</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your Name"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your Phone"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Password"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="seeker">Service Seeker</option>
                  <option value="provider">Service Provider</option>
                  <option value="admin">Service Admin</option>
                </select>
              </div>
              
              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </form>
            
            <div className="social-signup">
              <p className="social-signup-text">Or Signup with</p>
              <div className="social-buttons">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  shape="pill"
                  size="medium"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="login-link">
              Already have an account? <Link to="/login">Sign in</Link>
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

export default Signup;
