import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Thêm Link
import logo from '../logo-signaltopreview.jpg';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="SignalTopReview Logo" className="logo-image" />
        <span>SignalTopReview</span>
      </div>

      <button className="hamburger" onClick={toggleMenu}>
        <span className="hamburger-icon">☰</span>
      </button>

      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              Provider Board
            </Link>
          </li>
          <li>
            <Link to="/compare-providers" onClick={() => setIsMenuOpen(false)}>
              Compare
            </Link>
          </li>
          <li>
            <Link to="/profit-calculator" onClick={() => setIsMenuOpen(false)}>
              Profit Calculator
            </Link>
          </li>
          <li>More</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;