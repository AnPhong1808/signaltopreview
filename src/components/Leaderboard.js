import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [sortBy, setSortBy] = useState('R_result'); // Mặc định sắp xếp theo R_result
  const navigate = useNavigate();

  // Hàm gọi API
  const fetchProviders = async (pageNumber) => {
    try {
      const response = await fetch(`https://admin.tducoin.com/api/provider?page=${pageNumber}&per_page=20`, {
        method: 'GET',
        headers: {
          'x-api-key': 'oqKbBxKcEn9l4IXE4EqS2sgNzXPFvE',
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        const newData = pageNumber === 1 ? result.data : [...data, ...result.data];
        setData(newData);
        setPagination(result.pagination || {});
        sessionStorage.setItem('leaderboardData', JSON.stringify(newData));
        sessionStorage.setItem('leaderboardPagination', JSON.stringify(result.pagination || {}));
        sessionStorage.setItem('leaderboardPage', pageNumber.toString());
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  // Kiểm tra dữ liệu trong SessionStorage khi component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('leaderboardData');
    const storedPagination = sessionStorage.getItem('leaderboardPagination');
    const storedPage = sessionStorage.getItem('leaderboardPage');

    if (storedData && storedPagination && storedPage) {
      setData(JSON.parse(storedData));
      setPagination(JSON.parse(storedPagination));
      setPage(parseInt(storedPage, 10));
    } else {
      fetchProviders(page);
    }
  }, []); // Chỉ chạy khi component mount

  // Gọi API khi page thay đổi
  useEffect(() => {
    const storedData = sessionStorage.getItem('leaderboardData');
    if (!storedData || page > parseInt(sessionStorage.getItem('leaderboardPage') || '0', 10)) {
      fetchProviders(page);
    }
  }, [page]);

  // Hàm xử lý sắp xếp dữ liệu
  const sortData = (dataToSort, sortKey) => {
    return [...dataToSort].sort((a, b) => {
      let valueA = a[sortKey];
      let valueB = b[sortKey];

      if (sortKey === 'R_result') {
        valueA = parseFloat(valueA?.replace(/[^0-9.-]+/g, '')) || 0;
        valueB = parseFloat(valueB?.replace(/[^0-9.-]+/g, '')) || 0;
      } else if (sortKey === 'created_at') {
        // Sắp xếp theo thời gian tạo (mới nhất trước)
        valueA = new Date(valueA).getTime() || 0;
        valueB = new Date(valueB).getTime() || 0;
      } else {
        valueA = parseFloat(valueA) || 0;
        valueB = parseFloat(valueB) || 0;
      }

      return sortKey === 'created_at' ? valueB - valueA : valueB - valueA; // Giảm dần
    });
  };

  // Sắp xếp dữ liệu khi sortBy thay đổi
  useEffect(() => {
    if (data.length > 0) {
      const sortedData = sortData(data, sortBy);
      setData(sortedData);
      sessionStorage.setItem('leaderboardData', JSON.stringify(sortedData));
    }
  }, [sortBy]);

  // Hàm lấy Top 5 theo từng tiêu chí
  const getTop5ByCriteria = (criteria) => {
    const sorted = sortData(data, criteria);
    return sorted.slice(0, 5); // Lấy 5 phần tử đầu tiên
  };

  // Lấy Top 5 theo R_result, drawdown và created_at
  const top5RResult = getTop5ByCriteria('R_result');
  const top5Drawdown = getTop5ByCriteria('drawdown');
  const top5Newest = getTop5ByCriteria('created_at');

  // Xử lý khi nhấn nút "Load More"
  const handleLoadMore = () => {
    if (page < pagination.last_page) {
      setPage(page + 1);
    }
  };

  // Xử lý khi nhấn vào tab
  const handleTabClick = (tab) => {
    setSortBy(tab);
  };

  // Xử lý khi nhấn vào provider
  const handleProviderClick = (provider) => {
    navigate(`/provider/${provider.id}`, {
      state: {
        name: provider.name,
        avatar: provider.avatar,
        description: provider.description,
      },
    });
  };

  return (
    <div className="leaderboard">
      {/* Đưa 3 khung Top 5 lên trên phần tabs và bảng chính */}
      <div className="top-stats-container">
        {/* Top 5 R Result */}
        <div className="top-stats-box">
          <h3>Top 5 Highest R Result</h3>
          <ul>
            {top5RResult.map((provider, index) => (
              <li key={index} className="top-stats-item">
                <span className="provider-rank-name">{index + 1}. {provider.name ?? 'N/A'}</span>
                <span className="provider-value">{provider.R_result ?? 'N/A'}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 5 Max Drawdown */}
        <div className="top-stats-box">
          <h3>Top 5 Highest Max Drawdown</h3>
          <ul>
            {top5Drawdown.map((provider, index) => (
              <li key={index} className="top-stats-item">
                <span className="provider-rank-name">{index + 1}. {provider.name ?? 'N/A'}</span>
                <span className="provider-value">{provider.drawdown ? `${provider.drawdown}%` : 'N/A'}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 5 Providers mới nhất */}
        <div className="top-stats-box">
          <h3>Top 5 Newest Providers</h3>
          <ul>
            {top5Newest.map((provider, index) => (
              <li key={index} className="top-stats-item">
                <span className="provider-rank-name">{index + 1}. {provider.name ?? 'N/A'}</span>
                <span className="provider-value">
                  Created: {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="tabs-and-search">
        <div className="tabs">
          <button
            className={sortBy === 'R_result' ? 'active' : ''}
            onClick={() => handleTabClick('R_result')}
          >
            R RESULT
          </button>
          <button
            className={sortBy === 'drawdown' ? 'active' : ''}
            onClick={() => handleTabClick('drawdown')}
          >
            MAX. DRAWDOWN
          </button>
          <button
            className={sortBy === 'wpr' ? 'active' : ''}
            onClick={() => handleTabClick('wpr')}
          >
            WPR
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Providers</th>
            <th>R Result</th>
            <th>Max. Drawdown</th>
            <th>WPR</th>
            <th>Trades</th>
            <th>Sources</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} onClick={() => handleProviderClick(item)} style={{ cursor: 'pointer' }}>
              <td className="provider-cell">
                <span className="rank">{index + 1}</span>
                <div className="avatar" style={{ backgroundImage: item.avatar ? `url(${item.avatar})` : 'none' }}></div>
                <div className="provider-info">
                  <span className="provider-name">{item.name ?? 'N/A'}</span>
                  <span className="flag">{item.nation ?? 'N/A'}</span>
                </div>
              </td>
              <td className="r-result">{item.R_result ?? 'N/A'}</td>
              <td>{item.drawdown ? `${item.drawdown}%` : 'N/A'}</td>
              <td>{item.wpr ? `${item.wpr}%` : 'N/A'}</td>
              <td>{item.trades ?? 'N/A'}</td>
              <td>{item.source ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {page < pagination.last_page && (
        <div className="load-more">
          <button onClick={handleLoadMore}>Load More</button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;