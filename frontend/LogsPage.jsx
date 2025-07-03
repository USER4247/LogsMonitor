import React, { useState, useEffect } from 'react';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // all, error, warn, info, debug

  // on mount, fetch all logs
  useEffect(() => {
    fetchAllLogs();
  }, []);

  const fetchAllLogs = () => {
    fetch('http://localhost:5000/logs')
      .then(res => res.json())
      .then(data => {
        const logsArr = Object.keys(data)
          .filter(k => k !== 'filters')
          .map(k => ({ id: k, ...data[k] }));
        setLogs(logsArr);
      })
      .catch(err => console.error('Failed to fetch logs', err));
  };

  // search logs using indexed search
  const triggerSearch = async () => {
    const word = searchInput.trim().toLowerCase();
    if (!word) {
      fetchAllLogs();
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/logs/search?word=${word}`);
      const data = await res.json();
      const logsArr = data.map((log, idx) => ({ id: idx + 1, ...log }));
      setLogs(logsArr);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const onKeyDown = e => {
    if (e.key === 'Enter') triggerSearch();
  };

  const filteredLogs = logs.filter(log =>
    filterLevel === 'all' ? true : log.level === filterLevel
  );

  const styles = {
    container: { padding: 20, fontFamily: 'sans-serif' },
    searchContainer: {
      display: 'flex',
      marginBottom: 12,
      gap: 6,
      maxWidth: 500,
    },
    searchInput: {
      flex: 1,
      padding: 10,
      fontSize: 16,
      borderRadius: 6,
      border: '1px solid #ccc',
      boxSizing: 'border-box',
    },
    searchBtn: {
      padding: '10px 16px',
      borderRadius: 6,
      border: 'none',
      backgroundColor: '#007bff',
      color: 'white',
      cursor: 'pointer',
    },
    resetBtn: {
      padding: '10px 16px',
      borderRadius: 6,
      border: 'none',
      backgroundColor: '#6c757d',
      color: 'white',
      cursor: 'pointer',
    },
    filterBar: {
      marginBottom: 20,
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
    },
    filterBtn: {
      padding: '8px 14px',
      borderRadius: 6,
      border: '1px solid #007bff',
      backgroundColor: '#fff',
      color: '#007bff',
      cursor: 'pointer',
    },
    activeFilterBtn: {
      backgroundColor: '#007bff',
      color: '#fff',
    },
    logItem: {
      borderBottom: '1px solid #ddd',
      padding: '10px 0',
    },
    logLevel: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginRight: 10,
      fontSize: 12,
      padding: '2px 6px',
      borderRadius: 4,
      color: '#fff',
      display: 'inline-block',
    },
    error: { backgroundColor: '#dc3545' },
    warn: { backgroundColor: '#ffc107', color: '#000' },
    info: { backgroundColor: '#17a2b8' },
    debug: { backgroundColor: '#6c757d' },
  };

  return (
    <div style={styles.container}>
      <h2>Logs Page</h2>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search logs by word..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={onKeyDown}
          style={styles.searchInput}
        />
        <button onClick={triggerSearch} style={styles.searchBtn}>Search</button>
        <button onClick={fetchAllLogs} style={styles.resetBtn}>Reset</button>
      </div>

      <div style={styles.filterBar}>
        {['all', 'error', 'warn', 'info', 'debug'].map(level => (
          <button
            key={level}
            style={{
              ...styles.filterBtn,
              ...(filterLevel === level ? styles.activeFilterBtn : {}),
            }}
            onClick={() => setFilterLevel(level)}
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>

      <div>
        {filteredLogs.length === 0 ? (
          <p>No logs found.</p>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} style={styles.logItem}>
              <span
                style={{
                  ...styles.logLevel,
                  ...(styles[log.level] || {}),
                }}
              >
                {log.level}
              </span>
              <span>{log.message}</span>
              <div style={{ fontSize: 12, color: '#666' }}>
                {new Date(log.timestamp).toLocaleString()} - {log.resourceId}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogsPage;
