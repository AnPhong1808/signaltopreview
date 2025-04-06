import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
import TradingAccount from './TradingAccount';
import Rating from './Rating';
import './ProviderDetail.css';

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

const ProviderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [signals, setSignals] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const [timeRange, setTimeRange] = useState('7d');
  const tableBodyRef = useRef(null);
  const [activeTab, setActiveTab] = useState('trading'); // State để quản lý tab

  const providerData = location.state || {
    name: 'Unknown Provider',
    avatar: null,
    description: 'No description available.',
  };

  const fetchSignals = async (providerId, pageNumber) => {
    if (isLoading) return; // Tránh gọi API khi đang loading
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
        const newSignals = pageNumber === 1 ? result.data : [...signals, ...result.data];
        setSignals(newSignals);
        setPagination(result.pagination || {});
        sessionStorage.setItem(`signals_${providerId}`, JSON.stringify(newSignals));
        sessionStorage.setItem(`signals_pagination_${providerId}`, JSON.stringify(result.pagination || {}));
        sessionStorage.setItem(`signals_page_${providerId}`, pageNumber.toString());
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedSignals = sessionStorage.getItem(`signals_${id}`);
    const storedPagination = sessionStorage.getItem(`signals_pagination_${id}`);
    const storedPage = sessionStorage.getItem(`signals_page_${id}`);

    if (storedSignals && storedPagination && storedPage) {
      setSignals(JSON.parse(storedSignals));
      setPagination(JSON.parse(storedPagination));
      setPage(parseInt(storedPage, 10));
    } else {
      fetchSignals(id, 1); // Load trang đầu tiên
    }
  }, [id]);

  // Gọi fetchSignals khi page thay đổi
  useEffect(() => {
    if (page > 1) { // Chỉ gọi API nếu page > 1 (trang đầu đã được load trong useEffect đầu tiên)
      fetchSignals(id, page);
    }
  }, [page]);

  // Hàm để load thêm trang khi được gọi từ TradingAccount
  const handleLoadMore = () => {
    if (pagination.next_page_url && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const getChartData = () => {
    const now = new Date();
    let days;
    if (timeRange === '7d') days = 7;
    else if (timeRange === '1m') days = 30;
    else if (timeRange === '3m') days = 90;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    const filteredSignals = signals.filter(signal => {
      const signalDate = new Date(signal.openTime);
      return signalDate >= startDate && signalDate <= now;
    });

    const dateLabels = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      dateLabels.push(date.toLocaleDateString());
    }
    dateLabels.reverse();

    const rResultData = dateLabels.map(label => {
      const signalsOnDate = filteredSignals.filter(signal => {
        const signalDate = new Date(signal.openTime);
        return signalDate.toLocaleDateString() === label;
      });
      const totalRResult = signalsOnDate.reduce((sum, signal) => sum + parseFloat(signal.R_result), 0);
      return totalRResult;
    });

    return {
      labels: dateLabels,
      datasets: [
        {
          label: 'R Result (%)',
          data: rResultData,
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
          text: 'R Result (%)',
        },
        beginAtZero: true,
      },
    },
  };

  const getMonthlySignalsData = () => {
    const monthlyStats = pagination.monthly_stats || {};
    const labels = Object.keys(monthlyStats);
    const winningSignals = Object.values(monthlyStats).map(stat => stat.winning_signals || 0);
    const losingSignals = Object.values(monthlyStats).map(stat => stat.losing_signals || 0);

    return {
      labels: labels.length > 0 ? labels : Array(12).fill(''), // Đảm bảo 12 cột nếu không có dữ liệu
      datasets: [
        {
          label: 'Winning Signals',
          data: winningSignals,
          backgroundColor: '#28a745', // Màu xanh lá cho signal thắng
          borderColor: '#28a745',
          borderWidth: 1,
          stack: 'monthly', // Nhóm chồng lên nhau
        },
        {
          label: 'Losing Signals',
          data: losingSignals,
          backgroundColor: '#dc3545', // Màu đỏ cho signal thua
          borderColor: '#dc3545',
          borderWidth: 1,
          stack: 'monthly', // Nhóm chồng lên nhau
        },
      ],
    };
  };

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true, // Hiển thị legend để phân biệt thắng/thua
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
        stacked: true, // Chồng cột lên nhau
        title: {
          display: true,
          text: 'Number of Signals',
        },
        beginAtZero: true,
      },
    },
  };

  const getCataloguesData = () => {
    const cataloguesStats = pagination.catalogues_stats || {};
    const labels = Object.keys(cataloguesStats);
    const data = Object.values(cataloguesStats);

    return {
      labels: labels.length > 0 ? labels : ['No Data'], // Đảm bảo có ít nhất 1 nhãn nếu không có dữ liệu
      datasets: [
        {
          label: 'Catalogues',
          data: data.length > 0 ? data : [1], // Đảm bảo có dữ liệu mặc định nếu rỗng
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

  const calculateStatistics = () => {
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

  const stats = calculateStatistics();

  return (
    <div className="provider-detail">
      <div className="provider-header">
        <div className="provider-avatar" style={{ backgroundImage: providerData.avatar ? `url(${providerData.avatar})` : 'none' }}></div>
        <div className="provider-info">
          <h1>{providerData.name}</h1>
          <p>ID {id}</p>
          <p>{providerData.description}</p>
          <div className="provider-actions">
            <button
              className={`follow-btn ${activeTab === 'trading' ? 'active' : ''}`}
              onClick={() => setActiveTab('trading')}
            >
              Trading Account
            </button>
            <button
              className={`add-friend-btn ${activeTab === 'rating' ? 'active' : ''}`}
              onClick={() => setActiveTab('rating')}
            >
              Rating
            </button>
          </div>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'trading' && (
          <TradingAccount
            stats={stats}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            getChartData={getChartData}
            chartOptions={chartOptions}
            getMonthlySignalsData={getMonthlySignalsData}
            monthlyChartOptions={monthlyChartOptions}
            getCataloguesData={getCataloguesData}
            cataloguesChartOptions={cataloguesChartOptions}
            signals={signals}
            tableBodyRef={tableBodyRef}
            pagination={pagination}
            onLoadMore={handleLoadMore}
            isLoading={isLoading} // Truyền trạng thái loading xuống TradingAccount
          />
        )}

        {activeTab === 'rating' && <Rating />}
      </div>
    </div>
  );
};

export default ProviderDetail;