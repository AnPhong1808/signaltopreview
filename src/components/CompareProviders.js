import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Rating from './Rating';
import './CompareProviders.css';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CompareProviders = () => {
  const [providerId1, setProviderId1] = useState('');
  const [providerId2, setProviderId2] = useState('');
  const [provider1, setProvider1] = useState(null);
  const [provider2, setProvider2] = useState(null);
  const [signals1, setSignals1] = useState([]);
  const [signals2, setSignals2] = useState([]);
  const [pagination1, setPagination1] = useState({});
  const [pagination2, setPagination2] = useState({});
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const tableBodyRef1 = useRef(null);
  const tableBodyRef2 = useRef(null);
  const [activeTab, setActiveTab] = useState('statistics');
  const [error, setError] = useState('');

  const fetchProviderData = async (providerId) => {
    try {
      const response = await fetch(`https://admin.tducoin.com/api/provider/${providerId}`, {
        method: 'GET',
        headers: {
          'x-api-key': 'oqKbBxKcEn9l4IXE4EqS2sgNzXPFvE',
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(`Provider with ID ${providerId} not found`);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const fetchSignals = async (providerId, pageNumber, setSignals, setPagination, setIsLoading) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://admin.tducoin.com/api/provider/${providerId}/signals?page=${pageNumber}`, {
        method: 'GET',
        headers: {
          'x-api-key': 'oqKbBxKcEn9l4IXE4EqS2sgNzXPFvE',
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        const newSignals = pageNumber === 1 ? result.data : [...(providerId === provider1?.id ? signals1 : signals2), ...result.data];
        setSignals(newSignals);
        setPagination(result.pagination || {});
        sessionStorage.setItem(`signals_${providerId}`, JSON.stringify(newSignals));
        sessionStorage.setItem(`signals_pagination_${providerId}`, JSON.stringify(result.pagination || {}));
        sessionStorage.setItem(`signals_page_${providerId}`, pageNumber.toString());
      }
    } catch (error) {
      console.error(`Error fetching signals for provider ${providerId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!providerId1 || !providerId2) {
      setError('Please enter both provider IDs.');
      return;
    }

    if (providerId1 === providerId2) {
      setError('Please enter two different provider IDs.');
      return;
    }

    try {
      const [data1, data2] = await Promise.all([
        fetchProviderData(providerId1),
        fetchProviderData(providerId2),
      ]);

      setProvider1(data1);
      setProvider2(data2);

      setSignals1([]);
      setSignals2([]);
      setPagination1({});
      setPagination2({});
      setPage1(1);
      setPage2(1);

      await Promise.all([
        fetchSignals(providerId1, 1, setSignals1, setPagination1, setIsLoading1),
        fetchSignals(providerId2, 1, setSignals2, setPagination2, setIsLoading2),
      ]);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (!provider1 || !provider2 || page1 <= 1) return;
    fetchSignals(provider1.id, page1, setSignals1, setPagination1, setIsLoading1);
  }, [page1, provider1]);

  useEffect(() => {
    if (!provider1 || !provider2 || page2 <= 1) return;
    fetchSignals(provider2.id, page2, setSignals2, setPagination2, setIsLoading2);
  }, [page2, provider2]);

  const handleLoadMore1 = () => {
    if (pagination1.next_page_url && !isLoading1) {
      setPage1(prevPage => prevPage + 1);
    }
  };

  const handleLoadMore2 = () => {
    if (pagination2.next_page_url && !isLoading2) {
      setPage2(prevPage => prevPage + 1);
    }
  };

  const getChartData = (signals1, signals2) => {
    const now = new Date();
    let days;
    if (timeRange === '7d') days = 7;
    else if (timeRange === '1m') days = 30;
    else if (timeRange === '3m') days = 90;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    const filteredSignals1 = signals1.filter(signal => {
      const signalDate = new Date(signal.opened_at);
      return signalDate >= startDate && signalDate <= now;
    });

    const filteredSignals2 = signals2.filter(signal => {
      const signalDate = new Date(signal.opened_at);
      return signalDate >= startDate && signalDate <= now;
    });

    const dateLabels = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      dateLabels.push(date.toLocaleDateString());
    }
    dateLabels.reverse();

    const rResultData1 = dateLabels.map(label => {
      const signalsOnDate = filteredSignals1.filter(signal => {
        const signalDate = new Date(signal.opened_at);
        return signalDate.toLocaleDateString() === label;
      });
      const totalRResult = signalsOnDate.reduce((sum, signal) => sum + parseFloat(signal.R_result), 0);
      return totalRResult;
    });

    const rResultData2 = dateLabels.map(label => {
      const signalsOnDate = filteredSignals2.filter(signal => {
        const signalDate = new Date(signal.opened_at);
        return signalDate.toLocaleDateString() === label;
      });
      const totalRResult = signalsOnDate.reduce((sum, signal) => sum + parseFloat(signal.R_result), 0);
      return totalRResult;
    });

    return {
      labels: dateLabels,
      datasets: [
        {
          label: provider1?.name || 'Provider 1 - R Result',
          data: rResultData1,
          borderColor: '#00c4b4',
          backgroundColor: 'rgba(0, 196, 180, 0.2)',
          fill: true,
          tension: 0.3,
        },
        {
          label: provider2?.name || 'Provider 2 - R Result',
          data: rResultData2,
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.2)',
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
        text: 'R Result Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '',
        },
      },
      y: {
        title: {
          display: true,
          text: 'R Result',
        },
        beginAtZero: true,
      },
    },
  };

  const getMonthlySignalsData = (pagination) => {
    const monthlyStats = pagination.monthly_stats || {};
    const labels = Object.keys(monthlyStats);
    const winningSignals = Object.values(monthlyStats).map(stat => stat.winning_signals || 0);
    const losingSignals = Object.values(monthlyStats).map(stat => stat.losing_signals || 0);

    return {
      labels: labels.length > 0 ? labels : Array(12).fill(''),
      datasets: [
        {
          label: 'Winning Signals',
          data: winningSignals,
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          borderWidth: 1,
          stack: 'monthly',
        },
        {
          label: 'Losing Signals',
          data: losingSignals,
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          borderWidth: 1,
          stack: 'monthly',
        },
      ],
    };
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Signals (Wins vs Losses)',
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Month',
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Signals',
        },
        beginAtZero: true,
      },
    },
  };

  const getCataloguesData = (pagination) => {
    const cataloguesStats = pagination.catalogues_stats || {};
    const labels = Object.keys(cataloguesStats);
    const data = Object.values(cataloguesStats);

    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [
        {
          label: 'Catalogues',
          data: data.length > 0 ? data : [1],
          backgroundColor: [
            '#2196f3',
            '#ff9800',
            '#28a745',
            '#f44336',
            '#9c27b0',
            '#ffeb3b',
            '#795548',
          ],
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };
  };

  const cataloguesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 16,
          },
        },
      },
      title: {
        display: true,
        text: `Symbols (${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })})`,
        font: {
          size: 18,
        },
      },
    },
  };

  const calculateStatistics = (signals, pagination) => {
    const totalSignals = pagination.total || signals.length;
    const winningSignals = pagination.total_positive_r || 0;
    const losingSignals = pagination.total_negative_r || 0;
    const winRate = totalSignals > 0 ? ((winningSignals / totalSignals) * 100).toFixed(2) : 0;
    const totalRResult = signals.reduce((sum, signal) => sum + parseFloat(signal.R_result), 0).toFixed(2);
    const longestWinStreak = pagination.longest_win_streak || 0;
    const longestLossStreak = pagination.longest_loss_streak || 0;

    return {
      totalSignals,
      winningSignals,
      losingSignals,
      winRate,
      totalRResult,
      longestWinStreak,
      longestLossStreak,
    };
  };

  const stats1 = calculateStatistics(signals1, pagination1);
  const stats2 = calculateStatistics(signals2, pagination2);

  // Dữ liệu cho biểu đồ cột so sánh
  const getStatsBarData = () => {
    return {
      labels: [
        'Total Signals',
        'Winning Signals',
        'Losing Signals',
        'Win Rate (%)',
        'Total R Result',
        'Longest Win Streak',
        'Longest Loss Streak',
      ],
      datasets: [
        {
          label: provider1?.name || 'Provider 1',
          data: [
            stats1.totalSignals,
            stats1.winningSignals,
            stats1.losingSignals,
            stats1.winRate,
            stats1.totalRResult,
            stats1.longestWinStreak,
            stats1.longestLossStreak,
          ],
          backgroundColor: 'rgba(0, 196, 180, 0.6)',
          borderColor: '#00c4b4',
          borderWidth: 1,
        },
        {
          label: provider2?.name || 'Provider 2',
          data: [
            stats2.totalSignals,
            stats2.winningSignals,
            stats2.losingSignals,
            stats2.winRate,
            stats2.totalRResult,
            stats2.longestWinStreak,
            stats2.longestLossStreak,
          ],
          backgroundColor: 'rgba(255, 152, 0, 0.6)',
          borderColor: '#ff9800',
          borderWidth: 1,
        },
      ],
    };
  };

  const statsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistics Comparison',
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Metrics',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="cp-compare-providers">
      <div className="cp-compare-header">
        <h1>Compare Providers</h1>
        <form onSubmit={handleSubmit} className="cp-compare-form">
          <div className="cp-form-group">
            <label htmlFor="providerId1">Provider 1 ID:</label>
            <input
              type="text"
              id="providerId1"
              value={providerId1}
              onChange={(e) => setProviderId1(e.target.value)}
              placeholder="Enter Provider 1 ID"
            />
          </div>
          <div className="cp-form-group">
            <label htmlFor="providerId2">Provider 2 ID:</label>
            <input
              type="text"
              id="providerId2"
              value={providerId2}
              onChange={(e) => setProviderId2(e.target.value)}
              placeholder="Enter Provider 2 ID"
            />
          </div>
          <button type="submit">Compare</button>
        </form>
        {error && <div className="cp-error-message">{error}</div>}
      </div>

      {provider1 && provider2 && (
        <>
          <div className="cp-provider-info-compare">
            <div className="cp-provider-info">
              <div className="cp-provider-avatar" style={{ backgroundImage: provider1.avatar ? `url(${provider1.avatar})` : 'none' }}></div>
              <div>
                <h2>{provider1.name}</h2>
                <p>ID {provider1.id}</p>
                <p>{provider1.description}</p>
              </div>
            </div>
            <div className="cp-provider-info">
              <div className="cp-provider-avatar" style={{ backgroundImage: provider2.avatar ? `url(${provider2.avatar})` : 'none' }}></div>
              <div>
                <h2>{provider2.name}</h2>
                <p>ID {provider2.id}</p>
                <p>{provider2.description}</p>
              </div>
            </div>
          </div>

          <div className="cp-compare-tabs">
            <button
              className={`cp-tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              Statistics
            </button>
            <button
              className={`cp-tab-btn ${activeTab === 'rResult' ? 'active' : ''}`}
              onClick={() => setActiveTab('rResult')}
            >
              R Result Chart
            </button>
            <button
              className={`cp-tab-btn ${activeTab === 'monthlySignals' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthlySignals')}
            >
              Monthly Signals
            </button>
            <button
              className={`cp-tab-btn ${activeTab === 'catalogues' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalogues')}
            >
              Catalogues
            </button>
            <button
              className={`cp-tab-btn ${activeTab === 'signalsList' ? 'active' : ''}`}
              onClick={() => setActiveTab('signalsList')}
            >
              Signals List
            </button>
            <button
              className={`cp-tab-btn ${activeTab === 'rating' ? 'active' : ''}`}
              onClick={() => setActiveTab('rating')}
            >
              Rating
            </button>
          </div>

          <div className="cp-tab-content-container">
            {activeTab === 'statistics' && (
              <div className="cp-compare-section">
                <div className="cp-chart-item cp-chart-item-container">
                  <div className="cp-chart-wrapper">
                    <Bar data={getStatsBarData()} options={statsBarOptions} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rResult' && (
              <div className="cp-compare-section">
                <div className="cp-chart-r-result cp-chart-r-result-container">
                  <h3>R Result Comparison</h3>
                  <div className="cp-chart-controls">
                    <button
                      className={timeRange === '7d' ? 'active' : ''}
                      onClick={() => setTimeRange('7d')}
                    >
                      7 Days
                    </button>
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
                  </div>
                  <div className="cp-chart-wrapper">
                    <Line data={getChartData(signals1, signals2)} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monthlySignals' && (
              <div className="cp-compare-section">
                <div className="cp-chart-item cp-chart-item-container">
                  <h3>{provider1.name}</h3>
                  <div className="cp-chart-wrapper">
                    <Bar data={getMonthlySignalsData(pagination1)} options={monthlyChartOptions} />
                  </div>
                </div>
                <div className="cp-chart-item cp-chart-item-container">
                  <h3>{provider2.name}</h3>
                  <div className="cp-chart-wrapper">
                    <Bar data={getMonthlySignalsData(pagination2)} options={monthlyChartOptions} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'catalogues' && (
              <div className="cp-compare-section">
                <div className="cp-chart-item cp-chart-item-container">
                  <h3>{provider1.name}</h3>
                  <div className="cp-chart-wrapper">
                    <Pie data={getCataloguesData(pagination1)} options={cataloguesChartOptions} />
                  </div>
                </div>
                <div className="cp-chart-item cp-chart-item-container">
                  <h3>{provider2.name}</h3>
                  <div className="cp-chart-wrapper">
                    <Pie data={getCataloguesData(pagination2)} options={cataloguesChartOptions} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'signalsList' && (
              <div className="cp-compare-section">
                <div className="cp-signals-list-container cp-signals-list">
                  <h3>{provider1.name}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Type</th>
                        <th>R Result</th>
                        <th>Opened At</th>
                        <th>Closed At</th>
                      </tr>
                    </thead>
                    <tbody ref={tableBodyRef1} className="cp-signals-table-body">
                      {signals1.map((signal, index) => (
                        <tr key={index}>
                          <td>{signal.symbol}</td>
                          <td>{signal.isBuy ? 'Buy' : 'Sell'}</td>
                          <td className={parseFloat(signal.R_result) >= 0 ? 'cp-positive' : 'cp-negative'}>{signal.R_result}</td>
                          <td>{new Date(signal.opened_at).toLocaleString()}</td>
                          <td>{new Date(signal.closed_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isLoading1 && <div className="cp-loading-indicator">Loading more signals...</div>}
                </div>
                <div className="cp-signals-list-container cp-signals-list">
                  <h3>{provider2.name}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Type</th>
                        <th>R Result</th>
                        <th>Opened At</th>
                        <th>Closed At</th>
                      </tr>
                    </thead>
                    <tbody ref={tableBodyRef2} className="cp-signals-table-body">
                      {signals2.map((signal, index) => (
                        <tr key={index}>
                          <td>{signal.symbol}</td>
                          <td>{signal.isBuy ? 'Buy' : 'Sell'}</td>
                          <td className={parseFloat(signal.R_result) >= 0 ? 'cp-positive' : 'cp-negative'}>{signal.R_result}</td>
                          <td>{new Date(signal.opened_at).toLocaleString()}</td>
                          <td>{new Date(signal.closed_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isLoading2 && <div className="cp-loading-indicator">Loading more signals...</div>}
                </div>
              </div>
            )}

            {activeTab === 'rating' && (
              <div className="cp-compare-section">
                <div className="cp-rating-section-container cp-rating-section">
                  <h3>{provider1.name}</h3>
                  <Rating providerId={provider1.id} />
                </div>
                <div className="cp-rating-section-container cp-rating-section">
                  <h3>{provider2.name}</h3>
                  <Rating providerId={provider2.id} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CompareProviders;