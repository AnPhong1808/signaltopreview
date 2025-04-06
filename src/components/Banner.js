import React from 'react';
import mobileImage from '../mobile-tadaup.png'; // Import hình ảnh

const Banner = () => {
  return (
    <div className="banner">
      <div className="banner-content">
        <h1>A REVOLUTION IN TRADING METHODS</h1>
        <h2>AUTOMATED MULTI-PLATFORM PROVIDER FOLLOWING – OPTIMAL CAPITAL MANAGEMENT</h2>
        <p>Refund if the signal channel is ineffective</p>
        <a href="https://t.me/tadaupen_bot" target="_blank" rel="noopener noreferrer">
          <button>GET STARTED</button>
        </a>
      </div>
      <div className="banner-image">
        <img src={mobileImage} alt="Mobile Tadaup" />
      </div>
    </div>
  );
};

export default Banner;