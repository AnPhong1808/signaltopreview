import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo-signaltopreview.jpg';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCompareClick = () => {
    navigate('/compare-providers');
    setIsMenuOpen(false);
  };

  const handleBoardClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleCalculatorClick = () => {
    navigate('/profit-calculator');
    setIsMenuOpen(false);
  };

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
          <li onClick={handleBoardClick} style={{ cursor: 'pointer' }}>
            Provider Board
          </li>
          <li onClick={handleCompareClick} style={{ cursor: 'pointer' }}>
            Compare
          </li>
          <li onClick={handleCalculatorClick} style={{ cursor: 'pointer' }}>
            Profit Calculator
          </li>
          <li>More</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;