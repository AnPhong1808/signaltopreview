import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Kiểm tra và redirect nếu không có hash
if (window.location.hash === '') {
  window.location.hash = '#/';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);