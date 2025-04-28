import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo-signaltopreview.jpg';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State để điều khiển menu

  const handleCompareClick = () => {
    navigate('/compare-providers');
    setIsMenuOpen(false); // Đóng menu sau khi chọn
  };

  const handleBoardClick = () => {
    navigate('/');
    setIsMenuOpen(false); // Đóng menu sau khi chọn
  };

  const handleCalculatorClick = () => {
    navigate('/profit-calculator');
    setIsMenuOpen(false); // Đóng menu sau khi chọn
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Mở/đóng menu
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="SignalTopReview Logo" className="logo-image" />
        <span>SignalTopReview</span>
      </div>

      {/* Nút hamburger cho thiết bị di động */}
      <button className="hamburger" onClick={toggleMenu}>
        <span className="hamburger-icon">☰</span> {/* Biểu tượng hamburger */}
      </button>

      {/* Menu điều hướng */}
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
          <li>Use Policy</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;