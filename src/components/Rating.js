import React from 'react';
import { Bar } from 'react-chartjs-2'; // Import Bar chart từ react-chartjs-2

const Rating = () => {
  // Dữ liệu giả lập cho biểu đồ điểm qua 6 tháng gần nhất
  const getRatingChartData = () => {
    const labels = [
      'Oct 2024',
      'Nov 2024',
      'Dec 2024',
      'Jan 2025',
      'Feb 2025',
      'Mar 2025',
    ]; // 6 tháng gần nhất tính đến tháng 3/2025
    const data = [92.5, 93.0, 91.8, 92.3, 93.5, 93.07]; // Điểm giả lập

    return {
      labels,
      datasets: [
        {
          label: 'Rating Score',
          data,
          backgroundColor: '#00c4b4',
          borderColor: '#00c4b4',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Tắt tỷ lệ mặc định để điều chỉnh chiều cao tự do
    plugins: {
      legend: {
        display: false, // Ẩn legend
      },
      title: {
        display: false, // Bỏ tiêu đề
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
        title: {
          display: true,
          text: 'Score',
        },
        beginAtZero: false,
        min: 90, // Đặt giá trị tối thiểu để biểu đồ dễ nhìn
        max: 100, // Đặt giá trị tối đa
      },
    },
  };

  // Dữ liệu cho các hạng mục và thanh trạng thái
  const metrics = [
    { label: 'Account P/L', value: 49.99, max: 50 },
    { label: 'Order control', value: 9.3, max: 10 },
    { label: 'Instrument data', value: 4.06, max: 5 },
    { label: 'Position data', value: 20.0, max: 20 },
    { label: 'Trading style', value: 10.39, max: 15 },
  ];

  // Dữ liệu cho các mục trong Account P/L Details
  const accountDetails = [
    {
      label: 'Account P/L',
      score: 49.99,
      maxScore: 50,
      status: 'Excellent',
      metrics: [
        { label: 'Return', value: '1000000.00%' },
        { label: 'MDD', value: '0.16%' },
        { label: 'Return-to-risk Ratio', value: '100.00' },
      ],
      description:
        'Average monthly balance of account +2500000.00%. The monthly profitability is 100.00%. Profitability is extremely strong. The income is very stable. And the maximum drawdown is 0.16%. The return-to-risk ratio is 100.00. The trading risk is very low. The return-to-risk ratio is very high.',
    },
    {
      label: 'Order control',
      score: 9.93,
      maxScore: 10,
      status: 'Excellent',
      metrics: [
        { label: 'Total number of orders', value: '4797 orders' },
        { label: 'Trading frequency', value: '46.6 orders/day' },
        { label: 'TP/SL ratio', value: '97.54%' },
      ],
      description:
        'Cumulative trading for 103 days, 4797 orders. Average 46.6 orders per day. The trading frequency is relatively high. Reducing the trading frequency appropriately will help to better control risks. The take-profit and stop-loss are set for 97.54% orders. Clear trading goals and good trading habits.',
    },
    {
      label: 'Instruments & position',
      score: 24.06,
      maxScore: 25,
      status: 'Excellent',
      metrics: [
        { label: 'Big position ratio', value: '0.02%' },
        { label: 'Instruments', value: '1 items' },
        { label: 'P/L ratio', value: '18.75' },
      ],
      description:
        'Have good awareness of position risk control, and the overall position control is relatively reasonable. Among 4797 orders, big positions account for 0.02%. It is recommended to bring a stop profit and stop loss for all heavyweight orders, abandon the gambling mentality, and do a good job in risk control. The focused instrument is USDMK.Best at USDMK. Its accounts for 99.72% of the total profit. Keep working hard.',
    },
  ];

  return (
    <div className="rating-section">
      {/* Thêm phần Rating Summary phía trên, canh lề phải */}
      <div className="rating-summary">
        <div className="rating-grade">
          <span className="grade-text">A+</span>
        </div>
        <div className="rating-details">
          <span className="rating-label">Rating Score</span>
          <span className="rating-value">93.07</span>
        </div>
      </div>

      <div className="rating-header">
        <div className="rating-score">
          <div className="score-chart">
            <Bar data={getRatingChartData()} options={chartOptions} />
          </div>
        </div>
        <div className="rating-metrics">
          {metrics.map((metric, index) => (
            <div className="metric-item" key={index}>
              <div className="metric-header">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}</span>
              </div>
              <div className="metric-progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(metric.value / metric.max) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="account-pl">
        {accountDetails.map((detail, index) => (
          <div className="account-detail-wrapper" key={index}>
            <div className="account-detail-header">
              <h3>{detail.label}</h3>
              <span className="status-label">{detail.status}</span>
            </div>
            <div className="account-detail-item">
              <div className="account-detail-content">
                <div className="account-detail-score">
                  <div className="score-circle">
                    <span className="score-value">{detail.score}/{detail.maxScore}</span>
                    <span className="score-label">Score</span>
                  </div>
                </div>
                <div className="account-detail-metrics">
                  <div className="metrics-list">
                    {detail.metrics.map((metric, idx) => (
                      <div className="metric" key={idx}>
                        <span className="metric-label">{metric.label}</span>
                        <span className="metric-value">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="metric-description">{detail.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rating;