import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function sendLogsToBackend(logEntry) {
  fetch('http://localhost:5000/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logEntry),
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to send log');
      return res.json();
    })
    .then(data => {
      console.log('Log saved:', data);
    })
    .catch(err => {
      console.error('Error sending log:', err);
    });
}

function App() {
  const [showDialog, setShowDialog] = useState(false);
  const [level, setLevel] = useState('');
  const [message, setMessage] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [traceId, setTraceId] = useState('');
  const [spanId, setSpanId] = useState('');
  const [commit, setCommit] = useState('');
  const [metadata, setMetadata] = useState('{}'); 

  const navigate = useNavigate();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      background: '#f5f7fa',
      padding: '20px',
      boxSizing: 'border-box',
    },
    button: {
      margin: '10px',
      padding: '12px 28px',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      transition: 'background-color 0.3s ease',
    },
    dialogOverlay: {
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    dialogBox: {
      backgroundColor: '#fff',
      padding: '24px 28px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '480px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
      boxSizing: 'border-box',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    formGroup: {
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '6px',
      fontWeight: '600',
      fontSize: '14px',
    },
    input: {
      padding: '8px 10px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontFamily: 'inherit',
    },
    textarea: {
      minHeight: '70px',
      resize: 'vertical',
    },
    dialogFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '12px',
    },
    submitBtn: {
      backgroundColor: 'green',
      color: '#fff',
      border: 'none',
      padding: '10px 22px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '15px',
      boxShadow: '0 3px 8px rgba(0,128,0,0.4)',
      transition: 'background-color 0.3s ease',
    },
    cancelBtn: {
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      padding: '10px 22px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '15px',
      boxShadow: '0 3px 8px rgba(220,53,69,0.4)',
      transition: 'background-color 0.3s ease',
    },
    select: {
      padding: '8px 10px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontFamily: 'inherit',
    },
  };

  function handleSubmit() {
    // Validate JSON metadata
    let parsedMetadata;
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch {
      alert('Metadata must be valid JSON');
      return;
    }

    if (!level || !message || !resourceId || !timestamp || !traceId || !spanId || !commit) {
      alert('Please fill all required fields');
      return;
    }

    const logEntry = {
      level,
      message,
      resourceId,
      timestamp: new Date(timestamp).toISOString(),
      traceId,
      spanId,
      commit,
      metadata: parsedMetadata,
    };

    sendLogsToBackend(logEntry);

    //reset
    setLevel('');
    setMessage('');
    setResourceId('');
    setTimestamp(new Date().toISOString().slice(0, 16));
    setTraceId('');
    setSpanId('');
    setCommit('');
    setMetadata('{}');

    setShowDialog(false);
  }

  return (
    <div style={styles.container}>
      <h1>Log Monitor</h1>

      <button
        style={styles.button}
        onClick={() => setShowDialog(true)}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)}
      >
        ➕ Add Log
      </button>

      <button
        style={styles.button}
        onClick={() => navigate('/logs')}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)}
      >
        📄 Show Logs
      </button>

      {showDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogBox}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Level *</label>
              <select
                style={styles.select}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              >
                <option value="">-- Select level --</option>
                <option value="error">error</option>
                <option value="warn">warn</option>
                <option value="info">info</option>
                <option value="debug">debug</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Message *</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Resource ID *</label>
              <input
                style={styles.input}
                type="text"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Timestamp *</label>
              <input
                style={styles.input}
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Trace ID *</label>
              <input
                style={styles.input}
                type="text"
                value={traceId}
                onChange={(e) => setTraceId(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Span ID *</label>
              <input
                style={styles.input}
                type="text"
                value={spanId}
                onChange={(e) => setSpanId(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Commit *</label>
              <input
                style={styles.input}
                type="text"
                value={commit}
                onChange={(e) => setCommit(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Metadata (JSON)</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder='e.g. {"key": "value"}'
              />
            </div>

            <div style={styles.dialogFooter}>
              <button
                style={styles.submitBtn}
                onClick={handleSubmit}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#006400')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = styles.submitBtn.backgroundColor)}
              >
                Submit
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowDialog(false)}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#b02a37')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = styles.cancelBtn.backgroundColor)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
