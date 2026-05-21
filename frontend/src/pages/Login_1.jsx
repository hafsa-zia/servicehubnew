import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import '../css/Login.css';
import logoImage from '../assets/react.svg';
import logsigImage from '../assets/logsig.jpg';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Traditional email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { email });
      
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', res.data);
      
      if (!res.data.token) {
        setError('Server response missing token');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', res.data.token);
      
      // Decode token to get user role
      try {
        const decoded = jwtDecode(res.data.token);
        console.log('Decoded token:', decoded);
        
        // Redirect based on role
        if (decoded.role === 'admin') {
          navigate('/admin');
        } else if (decoded.role === 'provider') {
          navigate('/provider/dashboard'); // Consistent with route definition
        } else {
          navigate('/dashboard');
        }
        
        alert('Login successful!');
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        setError('Invalid token received from server');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.response.status === 404) {
          setError('Server endpoint not found. Is the backend running?');
        } else {
          setError(error.response.data.message || 'Login failed');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log('Error request:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogleSuccess = (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Google credential received');
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google token decoded:', decoded);

      axios
        .post('http://localhost:5000/api/auth/google-login', {
          token: credentialResponse.credential,
        })
        .then((res) => {
          console.log('Google login response:', res.data);
          
          if (!res.data.token) {
            setError('Server response missing token');
            setLoading(false);
            return;
          }
          
          localStorage.setItem('token', res.data.token);
          
          // Decode token to get user role
          const userDecoded = jwtDecode(res.data.token);
          console.log('Server token decoded:', userDecoded);
          
          // Redirect based on role
          if (userDecoded.role === 'admin') {
            navigate('/admin');
          } else if (userDecoded.role === 'provider') {
            navigate('/provider/dashboard'); // Consistent with route definition
          } else {
            navigate('/dashboard');
          }
          
          alert('Google login successful!');
        })
        .catch((error) => {
          console.error('Google login error:', error);
          
          if (error.response) {
            console.log('Error response data:', error.response.data);
            console.log('Error response status:', error.response.status);
            
            if (error.response.status === 401) {
              setError('Google authentication failed');
            } else {
              setError(error.response.data.message || 'Google login failed');
            }
          } else if (error.request) {
            console.log('Error request:', error.request);
            setError('No response from server. Please check your connection.');
          } else {
            setError('Error: ' + error.message);
          }
          
          setLoading(false);
        });
    } catch (error) {
      console.error('Error decoding Google token:', error);
      setError('Invalid Google token');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{
      background: `url(${logsigImage}) no-repeat center center`,
      backgroundSize: 'cover',
      position: 'relative',
      minHeight: '100vh',
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
            <a href="/signup" className="register-btn">Signup</a> 
          </div>
        </div>
      </header>

      <div className="login-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="login-card">
          <h2>Login to Your Account</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="social-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google login failed');
                console.error('Google login failed');
              }}
              disabled={loading}
            />
          </div>
          
          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
        {/* <div className="hero-image-container">
          <img src={loginImage} alt="Service professionals" className="hero-image" />
        </div> */}
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

export default Login;
