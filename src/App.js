import React from 'react';
import './App.css';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import Leaderboard from './components/Leaderboard';
import ProviderDetail from './components/ProviderDetail';
import CompareProviders from './components/CompareProviders';
import ProfitCalculator from './components/ProfitCalculator';

// Component để xử lý redirect
const RedirectToHash = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Nếu không có hash hoặc hash không bắt đầu bằng '#/', redirect đến '/'
    if (!location.hash || location.hash === '#') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="App">
        <RedirectToHash /> {/* Thêm component này để redirect */}
        <Header />
        <Banner />
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/provider/:id" element={<ProviderDetail />} />
          <Route path="/compare-providers" element={<CompareProviders />} />
          <Route path="/profit-calculator" element={<ProfitCalculator />} />
          <Route path="*" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;