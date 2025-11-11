import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="error-animation">
          <div className="error-number">404</div>
          <div className="error-circle"></div>
        </div>

        <h1 className="error-title">Oops! Page Not Found</h1>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="error-buttons">
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
          <button onClick={() => navigate('/products')} className="btn-secondary">
            Browse Products
          </button>
          <button onClick={() => navigate(-1)} className="btn-tertiary">
            Go Back
          </button>
        </div>

        <div className="quick-links">
          <h3>Quick Links</h3>
          <div className="links-grid">
            <button onClick={() => navigate('/')} className="quick-link">
              Home
            </button>
            <button onClick={() => navigate('/products')} className="quick-link">
              Products
            </button>
            <button onClick={() => navigate('/contact')} className="quick-link">
              Contact Us
            </button>
            <button onClick={() => navigate('/cart')} className="quick-link">
              Shopping Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
