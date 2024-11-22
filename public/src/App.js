import React, { useState } from 'react';

function App() {
  const [rtmpKey, setRtmpKey] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/set-rtmp-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rtmpKey }),
      });
      const result = await response.json();
      setMessage(result.message || 'RTMP key set successfully!');
    } catch (error) {
      console.error('Error setting RTMP key:', error);
      setMessage('Failed to set RTMP key.');
    }
  };

  return (
    <div>
      <h1>Enter RTMP Key</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={rtmpKey}
          onChange={(e) => setRtmpKey(e.target.value)}
          placeholder="Enter RTMP Key"
          required
        />
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
