import React, { useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';

const TradingAccount = ({
  stats,
  total_r,
  timeRange,
  setTimeRange,
  getChartData,
  chartOptions,
  getMonthlySignalsData,
  monthlyChartOptions,
  getCataloguesData,
  cataloguesChartOptions,
  signals,
  tableBodyRef,
  pagination,
  onLoadMore,
  isLoading, // Nhận trạng thái loading từ ProviderDetail
}) => {
  // Thêm sự kiện cuộn để phát hiện khi người dùng kéo xuống cuối danh sách
  useEffect(() => {
    const handleScroll = () => {
      if (!tableBodyRef.current || isLoading) return;

      const { scrollTop, scrollHeight, clientHeight } = tableBodyRef.current;
      // Kiểm tra nếu người dùng cuộn đến gần cuối (cách 50px)
      if (scrollHeight - scrollTop - clientHeight <= 50) {
        if (pagination.next_page_url) {
          onLoadMore(); // Gọi hàm onLoadMore để load thêm trang
        }
      }
    };

    const tableBody = tableBodyRef.current;
    if (tableBody) {
      tableBody.addEventListener('scroll', handleScroll);
    }

    // Cleanup sự kiện khi component unmount
    return () => {
      if (tableBody) {
        tableBody.removeEventListener('scroll', handleScroll);
      }
    };
  }, [tableBodyRef, onLoadMore, pagination, isLoading]);

  return (
    <>
      <div className="signals-statistics">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.totalSignals}</span>
            <span className="stat-label">Total Signals</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.winningSignals}</span>
            <span className="stat-label">Winning Signals</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.losingSignals}</span>
            <span className="stat-label">Losing Signals</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.winRate}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
          <div className="stat-item">
          <span className={`stat-value ${parseFloat(total_r) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(total_r).toFixed(2)}
            </span>
            <span className="stat-label">Total R Result</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.longestWinStreak}</span>
            <span className="stat-label">Longest Win Streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.longestLossStreak}</span>
            <span className="stat-label">Longest Loss Streak</span>
          </div>
        </div>
      </div>

      <div className="r-result-chart">
        <div className="chart-controls">
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
        <Line data={getChartData()} options={chartOptions} />
      </div>

      <div className="charts-container">
        <div className="chart-item">
          <Bar data={getMonthlySignalsData()} options={monthlyChartOptions} />
        </div>
        <div className="chart-item">
          <Pie data={getCataloguesData()} options={cataloguesChartOptions} />
        </div>
      </div>

      <div className="signals-list">
        <h2>Signals List</h2>
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Type</th>
              <th>R Result</th>
              <th>Opened Time</th>
              <th>Closed Time</th>
            </tr>
          </thead>
          <tbody ref={tableBodyRef} className="signals-table-body">
            {signals.map((signal, index) => (
              <tr key={index}>
                <td>{signal.symbol}</td>
                <td>{signal.isBuy ? 'Buy' : 'Sell'}</td>
                <td className={parseFloat(signal.R_result) >= 0 ? 'positive' : 'negative'}>{signal.R_result}</td>
                <td>{new Date(signal.openTime).toLocaleString()}</td>
                <td>{new Date(signal.closeTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="loading">Loading more signals...</div>}
      </div>
    </>
  );
};

export default TradingAccount;