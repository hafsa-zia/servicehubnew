import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';
import logoImage from '../assets/react.svg';
import BackImage from '../assets/Back.JPG';

const Home = () => {
  return (
    <div className="container">
      {/* Header Section */}
       <header className="header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src={logoImage} alt="ServiceHub Logo" className="logo-image" />
            <span>ServiceHub</span>
          </Link>
          <nav className="nav-links">
          {/* <Link to="/">Home</Link>
            <Link to="/services">Services</Link> */}
          </nav>
          <div className="auth-buttons">
           <a href="/login" className="login-btn">Login</a>
           <a href="/signup" className="register-btn">Signup</a> 
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title">
              Design your service experience <span className="highlight">confidently</span>
            </h1>
            <p className="hero-description">
              ServiceHub is a comprehensive service platform that takes the guesswork out of finding reliable service providers by connecting you with verified professionals.
            </p>
            <Link to="/login">
              <button className="explore-btn">
                Get started
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cta-icon" style={{marginLeft: '10px', verticalAlign: 'middle'}}>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </Link>
            <div className="trusted-by">
              <p className="trusted-text">
                The world's best homeowners rely on ServiceHub to find trusted service professionals.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
