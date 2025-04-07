import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWrapper from './App';

// Kiểm tra và redirect nếu không có hash
if (!window.location.hash || window.location.hash === '#') {
  // Thay đổi URL để bao gồm '#/'. Sử dụng replaceState để không tạo thêm lịch sử
  window.history.replaceState(null, null, window.location.pathname + window.location.search + '#/');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);