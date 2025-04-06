import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [sortBy, setSortBy] = useState('R_result');
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const [error, setError] = useState(null); // Thêm trạng thái lỗi
  const navigate = useNavigate();

  // Hàm gọi API
  const fetchProviders = async (pageNumber) => {
    try {
      setIsLoading(true); // Bắt đầu tải
      setError(null); // Reset lỗi
      const response = await fetch(`https://admin.tducoin.com/api/provider?page=${pageNumber}`, {
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
      } else {
        setError('Không thể tải dữ liệu từ API.');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Đã có lỗi xảy ra khi tải dữ liệu.');
    } finally {
      setIsLoading(false); // Kết thúc tải
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
        valueA = parseFloat(valueA.replace(/[^0-9.-]+/g, '')) || 0;
        valueB = parseFloat(valueB.replace(/[^0-9.-]+/g, '')) || 0;
      } else if (sortKey === 'created_at') {
        valueA = new Date(valueA).getTime() || 0;
        valueB = new Date(valueB).getTime() || 0;
      } else {
        valueA = parseFloat(valueA) || 0;
        valueB = parseFloat(valueB) || 0;
      }

      return sortKey === 'created_at' ? valueB - valueA : valueB - valueA; // Giảm dần
    });
  };

  // Sử dụng useMemo để tối ưu hóa việc sắp xếp
  const sortedData = useMemo(() => {
    if (data.length > 0) {
      return sortData(data, sortBy);
    }
    return [];
  }, [data, sortBy]);

  // Cập nhật sessionStorage khi sortedData thay đổi
  useEffect(() => {
    if (sortedData.length > 0) {
      sessionStorage.setItem('leaderboardData', JSON.stringify(sortedData));
    }
  }, [sortedData]);

  // Hàm lấy Top 5 theo từng tiêu chí
  const getTop5ByCriteria = (criteria) => {
    const sorted = sortData(data, criteria);
    return sorted.slice(0, 5);
  };

  const top5RResult = getTop5ByCriteria('R_result');
  const top5Drawdown = getTop5ByCriteria('drawdown');
  const top5Newest = getTop5ByCriteria('created_at');

  const handleLoadMore = () => {
    if (page < pagination.last_page) {
      setPage(page + 1);
    }
  };

  const handleTabClick = (tab) => {
    setSortBy(tab);
  };

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
      {/* Hiển thị trạng thái loading hoặc lỗi */}
      {isLoading && <div className="loading">Đang tải dữ liệu...</div>}
      {error && <div className="error">{error}</div>}

      {/* Hiển thị nội dung khi không có lỗi */}
      {!isLoading && !error && (
        <>
          <div className="top-stats-container">
            <div className="top-stats-box">
              <h3>Top 5 Highest R Result</h3>
              {top5RResult.length > 0 ? (
                <ul>
                  {top5RResult.map((provider, index) => (
                    <li key={index} className="top-stats-item">
                      <span className="provider-rank-name">{index + 1}. {provider.name}</span>
                      <span className="provider-value">{provider.R_result}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Không có dữ liệu để hiển thị.</p>
              )}
            </div>

            <div className="top-stats-box">
              <h3>Top 5 Highest Max Drawdown</h3>
              {top5Drawdown.length > 0 ? (
                <ul>
                  {top5Drawdown.map((provider, index) => (
                    <li key={index} className="top-stats-item">
                      <span className="provider-rank-name">{index + 1}. {provider.name}</span>
                      <span className="provider-value">{provider.drawdown}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Không có dữ liệu để hiển thị.</p>
              )}
            </div>

            <div className="top-stats-box">
              <h3>Top 5 Newest Providers</h3>
              {top5Newest.length > 0 ? (
                <ul>
                  {top5Newest.map((provider, index) => (
                    <li key={index} className="top-stats-item">
                      <span className="provider-rank-name">{index + 1}. {provider.name}</span>
                      <span className="provider-value">
                        Created: {new Date(provider.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Không có dữ liệu để hiển thị.</p>
              )}
            </div>
          </div>

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

          {sortedData.length > 0 ? (
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
                {sortedData.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => handleProviderClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="provider-cell">
                      <span className="rank">{index + 1}</span>
                      <div
                        className="avatar"
                        style={{ backgroundImage: item.avatar ? `url(${item.avatar})` : 'none' }}
                      ></div>
                      <div className="provider-info">
                        <span className="provider-name">{item.name}</span>
                        <span className="flag">{item.nation}</span>
                      </div>
                    </td>
                    <td className="r-result">{item.R_result}</td>
                    <td>{item.drawdown ? `${item.drawdown}%` : ''}</td>
                    <td>{item.wpr ? `${item.wpr}%` : ''}</td>
                    <td>{item.trades}</td>
                    <td>{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có dữ liệu để hiển thị.</p>
          )}

          {page < pagination.last_page && (
            <div className="load-more">
              <button onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? 'Đang tải...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;