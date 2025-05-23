import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import Leaderboard from './components/Leaderboard';
import ProviderDetail from './components/ProviderDetail';
import CompareProviders from './components/CompareProviders';
import ProfitCalculator from './components/ProfitCalculator';
import './App.css';

function App() {
  console.log('App component rendered');
  return (
    <div className="App">
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
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
