import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [sortBy, setSortBy] = useState('R_result');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Trạng thái để kiểm soát nút Load More/Back
  const navigate = useNavigate();

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
        setOriginalData(newData);
        setPagination(result.pagination || {});
        sessionStorage.setItem('leaderboardData', JSON.stringify(newData));
        sessionStorage.setItem('leaderboardPagination', JSON.stringify(result.pagination || {}));
        sessionStorage.setItem('leaderboardPage', pageNumber.toString());
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const searchProvider = async (query) => {
    // Kiểm tra trong sessionStorage trước
    const storedData = JSON.parse(sessionStorage.getItem('leaderboardData') || '[]');
    const foundProvider = storedData.find(
      (provider) => provider.name?.toLowerCase() === query.toLowerCase() || provider.id === query
    );

    if (foundProvider) {
      setData([foundProvider]);
      setSearchMessage('');
      setIsSearching(true);
    } else {
      // Nếu không tìm thấy trong sessionStorage, gọi API
      try {
        const response = await fetch(`https://admin.tducoin.com/api/provider/search?search_string=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'x-api-key': 'oqKbBxKcEn9l4IXE4EqS2sgNzXPFvE',
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        console.log('Search result:', result);
        if (result.success) {
          setData([result.data]);
          setSearchMessage('');
          setIsSearching(true);

          // Bổ sung provider mới vào sessionStorage nếu chưa có
          const updatedData = [...storedData, result.data].filter(
            (provider, index, self) => self.findIndex((p) => p.id === provider.id) === index // Loại bỏ trùng lặp
          );
          sessionStorage.setItem('leaderboardData', JSON.stringify(updatedData));
          setOriginalData(updatedData); // Cập nhật originalData
        } else {
          setData([]);
          setSearchMessage('Provider not found');
          setIsSearching(true);
        }
      } catch (error) {
        console.error('Error searching provider:', error);
        setSearchMessage('Error occurred while searching');
        setIsSearching(true);
      }
    }
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem('leaderboardData');
    const storedPagination = sessionStorage.getItem('leaderboardPagination');
    const storedPage = sessionStorage.getItem('leaderboardPage');

    if (storedData && storedPagination && storedPage) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      setOriginalData(parsedData);
      setPagination(JSON.parse(storedPagination));
      setPage(parseInt(storedPage, 10));
    } else {
      fetchProviders(page);
    }
  }, []);

  useEffect(() => {
    const storedData = sessionStorage.getItem('leaderboardData');
    if (!storedData || page > parseInt(sessionStorage.getItem('leaderboardPage') || '0', 10)) {
      fetchProviders(page);
    }
  }, [page]);

  const sortData = (dataToSort, sortKey) => {
    return [...dataToSort].sort((a, b) => {
      let valueA = a[sortKey];
      let valueB = b[sortKey];

      if (sortKey === 'R_result') {
        valueA = parseFloat(valueA?.replace(/[^0-9.-]+/g, '')) || 0;
        valueB = parseFloat(valueB?.replace(/[^0-9.-]+/g, '')) || 0;
      } else if (sortKey === 'created_at') {
        valueA = new Date(valueA).getTime() || 0;
        valueB = new Date(valueB).getTime() || 0;
      } else {
        valueA = parseFloat(valueA) || 0;
        valueB = parseFloat(valueB) || 0;
      }

      return sortKey === 'created_at' ? valueB - valueA : valueB - valueA;
    });
  };

  useEffect(() => {
    if (data.length > 0 && !searchQuery) {
      const sortedData = sortData(data, sortBy);
      setData(sortedData);
      sessionStorage.setItem('leaderboardData', JSON.stringify(sortedData));
    }
  }, [sortBy]);

  const getTop5ByCriteria = (criteria) => {
    const sorted = sortData(originalData, criteria);
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value) {
      setData(originalData);
      setSearchMessage('');
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery) {
      searchProvider(searchQuery);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery) {
      searchProvider(searchQuery);
    }
  };

  const handleBack = () => {
    setData(originalData);
    setSearchQuery('');
    setSearchMessage('');
    setIsSearching(false);
  };

  return (
    <div className="leaderboard">
      <div className="top-stats-container">
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
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
          <span className="search-icon" onClick={handleSearchSubmit}>🔍</span>
        </div>
      </div>

      {searchMessage && (
        <div className="search-message" style={{ textAlign: 'center', color: 'red', margin: '10px 0' }}>
          {searchMessage}
        </div>
      )}

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
      <div className="load-more">
        {isSearching ? (
          <button onClick={handleBack}>Back</button>
        ) : (
          page < pagination.last_page && <button onClick={handleLoadMore}>Load More</button>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;