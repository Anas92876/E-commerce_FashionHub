import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>FashionHub</h1>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <span className="welcome-text">
                Welcome, {user.firstName}!
              </span>
              <button onClick={handleLogout} className="nav-button logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="nav-button login-btn"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="nav-button register-btn"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="home-main">
        <div className="hero-section">
          <h2>Welcome to FashionHub</h2>
          <p>Your one-stop shop for trendy clothing</p>
          {!user && (
            <div className="cta-buttons">
              <button
                onClick={() => navigate('/register')}
                className="cta-button primary"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="cta-button secondary"
              >
                Sign In
              </button>
            </div>
          )}
          {user && (
            <div className="user-info">
              <h3>Account Information</h3>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 FashionHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
