import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import Leaderboard from './components/Leaderboard';
import ProviderDetail from './components/ProviderDetail';
import CompareProviders from './components/CompareProviders';
import ProfitCalculator from './components/ProfitCalculator';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Banner />
        <Routes>
            <Route path="/" element={<Leaderboard />} />
            <Route path="/provider/:id" element={<ProviderDetail />} />
            <Route path="/compare-providers" element={<CompareProviders />} />
            <Route path="/profit-calculator" element={<ProfitCalculator />} />
          </Routes>        
      </div>
    </Router>
  );
}

export default App;