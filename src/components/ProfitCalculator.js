import React, { useState } from 'react';
import './ProfitCalculator.css';

const ProfitCalculator = () => {
  const [capital, setCapital] = useState('');
  const [providerId, setProviderId] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [strategy, setStrategy] = useState('');
  const [moveSLToEntry, setMoveSLToEntry] = useState(false); // Đổi tên từ command1 thành moveSLToEntry
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const strategies = [
    'Fixed Lot',
    'Fixed Risk',
    'Martingale',
    'Anti-Martingale',
    'Kelly Criterion',
    'Fibonacci',
    "D'Alembert",
    'Paroli',
    'Custom Strategy',
  ];

  const handleConfirm = () => {
    if (!capital || !providerId || !timeRange || !strategy) {
      alert('Please fill in all required fields.');
      return;
    }

    const calculatedProfit = {
      initialCapital: parseFloat(capital),
      providerId,
      timeRange,
      strategy,
      moveSLToEntry, // Đổi tên từ command1
      estimatedProfit: parseFloat(capital) * 0.1,
      profitPercentage: 10,
    };

    setResults(calculatedProfit);
    setShowResults(true);
  };

  return (
    <div className="profit-calculator">
      <h1>Profit Calculator</h1>

      <div className="pc-options-container">
        {/* Ô 1: Vốn giả định, ID Provider, Thời gian */}
        <div className="pc-options-box">
          <h3>Investment Settings</h3>
          <div className="pc-input-group">
            <label>Assumed Capital ($):</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="Enter capital"
            />
          </div>
          <div className="pc-input-group">
            <label>Provider ID:</label>
            <input
              type="text"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              placeholder="Enter Provider ID"
            />
          </div>
          <div className="pc-input-group">
            <label>Time Range:</label>
            <div className="pc-time-buttons">
              <button
                className={timeRange === '1m' ? 'active' : ''}
                onClick={() => setTimeRange('1m')}
              >
                1 Month
              </button>
              <button
                className={timeRange === '3m' ? 'active' : ''}
                onClick={() => setTimeRange('3m')}
              >
                3 Months
              </button>
              <button
                className={timeRange === '6m' ? 'active' : ''}
                onClick={() => setTimeRange('6m')}
              >
                6 Months
              </button>
            </div>
          </div>
        </div>

        {/* Ô 2: Chiến lược quản lý vốn và checkbox */}
        <div className="pc-options-box">
          <h3>Strategy Settings</h3>
          <div className="pc-input-group">
            <label>Capital Management Strategy:</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option value="">Select a strategy</option>
              {strategies.map((strat, index) => (
                <option key={index} value={strat}>
                  {strat}
                </option>
              ))}
            </select>
          </div>
          <div className="pc-input-group">
            <label>Additional Options:</label>
            <div className="pc-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={moveSLToEntry}
                  onChange={(e) => setMoveSLToEntry(e.target.checked)}
                />
                Move SL to Entry
              </label>
              {/* Bỏ Command 2 */}
            </div>
          </div>
        </div>

        {/* Ô 3: Guideline */}
        <div className="pc-options-box">
          <h3>Guideline</h3>
          <ul>
            <li>
              These capital management strategies are analyzed and automatically executed by the trading bot from Mini App TadaUp (<a href="https://www.t.me/tadaupen_bot" target="_blank" rel="noopener noreferrer">www.t.me/tadaupen_bot</a>).
            </li>
            <li>
              The results are backtested using historical data from signals, trading products, and actual market fluctuations at that time.
            </li>
          </ul>
        </div>
      </div>

      {/* Nút Confirm */}
      <div className="pc-confirm-button">
        <button onClick={handleConfirm}>Confirm</button>
      </div>

      {/* Bảng thống kê lợi nhuận */}
      {showResults && results && (
        <div className="pc-results-table">
          <h2>Profit Statistics</h2>
          <table>
            <thead>
              <tr>
                <th>Initial Capital</th>
                <th>Provider ID</th>
                <th>Time Range</th>
                <th>Strategy</th>
                <th>Move SL to Entry</th> {/* Đổi tên cột */}
                <th>Estimated Profit</th>
                <th>Profit Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${results.initialCapital.toFixed(2)}</td>
                <td>{results.providerId}</td>
                <td>{results.timeRange}</td>
                <td>{results.strategy}</td>
                <td>{results.moveSLToEntry ? 'Yes' : 'No'}</td>
                <td>${results.estimatedProfit.toFixed(2)}</td>
                <td>{results.profitPercentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProfitCalculator;