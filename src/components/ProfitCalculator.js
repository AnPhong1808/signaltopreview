import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ProfitCalculator.css';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProfitCalculator = () => {
  const [capital, setCapital] = useState('');
  const [providerId, setProviderId] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [strategy, setStrategy] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [profitData, setProfitData] = useState([]);
  const [error, setError] = useState('');

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

  // Hàm gọi API để lấy dữ liệu lợi nhuận
  const fetchProfitData = async () => {
    try {
      // Chuyển đổi timeRange thành định dạng API mong muốn (1month, 3months, 6months)
      const periodMap = {
        '1m': '1month',
        '3m': '3months',
        '6m': '6months',
      };
      const period = periodMap[timeRange];

      // Chuyển đổi strategy thành index (0-8) để khớp với API
      const strategyIndex = strategies.indexOf(strategy).toString();

      const response = await fetch(
        `https://admin.tducoin.com/api/provider/${providerId}/profit?period=${period}&capital=${capital}&strategy=${strategyIndex}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': 'oqKbBxKcEn9l4IXE4EqS2sgNzXPFvE',
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      if (result.status === 'success') {
        setProfitData(result.data);
        setShowResults(true);
        setError('');
      } else {
        throw new Error(result.message || 'Failed to fetch profit data');
      }
    } catch (error) {
      setError(error.message);
      setShowResults(false);
      setProfitData([]);
    }
  };

  const handleConfirm = () => {
    if (!capital || !providerId || !timeRange || !strategy) {
      alert('Please fill in all required fields.');
      return;
    }

    fetchProfitData();
  };

  // Tạo dữ liệu cho biểu đồ
  const getProfitChartData = () => {
    const labels = profitData.map(item => item.date);
    const data = profitData.map(item => item.income_amount);

    return {
      labels,
      datasets: [
        {
          label: 'Profit (USD)',
          data,
          borderColor: '#00c4b4',
          backgroundColor: 'rgba(0, 196, 180, 0.2)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Profit Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Profit (USD)',
        },
        beginAtZero: true,
      },
    },
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
                  checked={true} // Luôn được chọn
                  disabled // Không cho phép thay đổi
                />
                Move SL to Entry
              </label>
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

      {/* Hiển thị lỗi nếu có */}
      {error && <div className="pc-error-message">{error}</div>}

      {/* Biểu đồ lợi nhuận thay vì bảng */}
      {showResults && profitData.length > 0 && (
        <div className="pc-results-chart">
          <h2>Profit Chart</h2>
          <div className="pc-chart-wrapper">
            <Line data={getProfitChartData()} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitCalculator;