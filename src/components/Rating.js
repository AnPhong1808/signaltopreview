import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2'; // Import Bar chart từ react-chartjs-2
import axios from 'axios'; // Import axios để gọi API

const Rating = ({ providerId }) => { // providerId là prop bắt buộc, không có mặc định
  const [ratingData, setRatingData] = useState(null);

  // Hàm gọi API với cấu hình từ curl
  const fetchRatingData = async (id) => {
    try {
      const response = await axios.get(`https://admin.tducoin.com/api/provider/rating/${id}`, {
        headers: {
          'x-api-key': 'oqKbBxKcEn9l4IXE4EqS2sgNzXPFvE',
          'Content-Type': 'application/json',
        },
      });
      const data = response.data.data; // Giả sử API trả về mảng trong 'data'
      sessionStorage.setItem(`rating_${id}`, JSON.stringify(data)); // Lưu riêng theo provider_id
      setRatingData(data);
    } catch (error) {
      console.error('Error fetching rating data:', error);
    }
  };

  // Kiểm tra sessionStorage khi component mount hoặc providerId thay đổi
  useEffect(() => {
    if (!providerId) {
      console.error('providerId is required');
      return;
    }
    const storedData = sessionStorage.getItem(`rating_${providerId}`);
    if (storedData) {
      setRatingData(JSON.parse(storedData));
    } else {
      fetchRatingData(providerId);
    }
  }, [providerId]); // Thêm providerId vào dependency array để gọi lại khi thay đổi

  // Dữ liệu cho biểu đồ dựa trên API
  const getRatingChartData = () => {
    if (!ratingData || ratingData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Rating Score',
            data: [],
            backgroundColor: '#00c4b4',
            borderColor: '#00c4b4',
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = ratingData.map((item) => item.month); // Lấy danh sách tháng từ API
    const scores = ratingData.map((item) => item.total_score); // Lấy total_score làm điểm số

    return {
      labels,
      datasets: [
        {
          label: 'Rating Score',
          data: scores,
          backgroundColor: '#00c4b4',
          borderColor: '#00c4b4',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
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
        min: -50, // Điều chỉnh để phù hợp với giá trị âm từ API nếu có
        max: 100,
      },
    },
  };

  // Dữ liệu cho các hạng mục và thanh trạng thái từ API
  const getMetrics = () => {
    if (!ratingData || ratingData.length === 0) {
      return [];
    }
    const latestMonth = ratingData[ratingData.length - 1]; // Lấy tháng gần nhất
    return [
      { label: 'Performance Score', value: latestMonth.performance_score, max: 50 },
      { label: 'Community Score', value: latestMonth.community_score, max: 20 },
      { label: 'Longterm Score', value: latestMonth.longterm_score, max: 30 },
    ];
  };

  // Dữ liệu cho Account P/L Details từ API
  const getAccountDetails = () => {
    if (!ratingData || ratingData.length === 0) {
      return [];
    }
    const latestMonth = ratingData[ratingData.length - 1]; // Lấy tháng gần nhất
    return [
      {
        label: 'Performance Score',
        score: latestMonth.performance_score,
        maxScore: 50,
        status: latestMonth.status,
        metrics: [
          { label: 'Consistency', value: 'N/A' }, // Thay bằng dữ liệu thực nếu có
          { label: 'Duration', value: 'N/A' },
          { label: 'Stability', value: 'N/A' },
        ],
        description: 'Performance evaluation based on trading signals.',
      },
      {
        label: 'Community Score',
        score: latestMonth.community_score,
        maxScore: 20,
        status: latestMonth.status,
        metrics: [
          { label: 'Followers', value: 'N/A' },
          { label: 'Transparency', value: 'N/A' },
          { label: 'Interaction', value: 'N/A' },
        ],
        description: 'Community trust evaluation.',
      },
      {
        label: 'Longterm Score',
        score: latestMonth.longterm_score,
        maxScore: 30,
        status: latestMonth.status,
        metrics: [
          { label: 'Consistency Months', value: 'N/A' },
          { label: 'Stability', value: 'N/A' },
          { label: 'Degradation', value: 'N/A' },
        ],
        description: 'Long-term trust evaluation.',
      },
    ];
  };

  // Lấy Rating Score và Status từ tháng gần nhất
  const latestRating = ratingData && ratingData.length > 0 ? ratingData[ratingData.length - 1] : null;

  return (
    <div className="rating-section">
      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-grade">
          <span className="grade-text">{latestRating?.status === 'Qualified' ? 'A+' : 'B'}</span>
        </div>
        <div className="rating-details">
          <span className="rating-label">Rating Score</span>
          <span className="rating-value">{latestRating ? latestRating.total_score : 'N/A'}</span>
        </div>
      </div>

      <div className="rating-header">
        <div className="rating-score">
          <div className="score-chart">
            <Bar data={getRatingChartData()} options={chartOptions} />
          </div>
        </div>
        <div className="rating-metrics">
          {getMetrics().map((metric, index) => (
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
        {getAccountDetails().map((detail, index) => (
          <div className="account-detail-wrapper" key={index}>
            <div className="account-detail-header">
              <h3>{detail.label}</h3>
              <span
                className={`status-label ${
                  detail.status === 'Disqualified' ? 'disqualified' : 'qualified'
                }`}
              >
                {detail.status}
              </span>
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

      {/* CSS nội tuyến */}
      <style jsx>{`
        .status-label {
          padding: 4px 8px;
          border-radius: 8px;
        }
        .qualified {
          background-color:rgb(2, 150, 27); /* Màu mặc định (xanh) */
          color: white;
        }
        .disqualified {
          background-color: red; /* Màu đỏ cho Disqualified */
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Rating;