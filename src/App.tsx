import { useCoinData } from './hooks/useCoinData';
import { HeatmapGrid } from './components/HeatmapGrid';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const { coins, loading, error, lastUpdate } = useCoinData({
    pollInterval: 10000, // 10 seconds
    coinCount: 50,
  });

  // Force re-render every second to update "Last updated" display
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Made @ seekehr.github.io</h1>
          <div className="status-bar">
            <span className="last-update">
              Last updated: {formatLastUpdate(lastUpdate)}
            </span>
            <span className={`status-indicator ${error ? 'error' : 'ok'}`}>
              {error ? `Error: ${error.message}` : 'Connected'}
            </span>
          </div>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-color strong-loss"></span>
            <span className="legend-label">&lt; -5%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color loss"></span>
            <span className="legend-label">-1% to -5%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color neutral"></span>
            <span className="legend-label">-1% to +1%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color gain"></span>
            <span className="legend-label">+1% to +5%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color strong-gain"></span>
            <span className="legend-label">&gt; +5%</span>
          </div>
        </div>
      </header>

      <main>
        <HeatmapGrid coins={coins} loading={loading} />
      </main>

      <footer className="footer">
        <p>Data provided by CoinGecko API</p>
      </footer>
    </div>
  );
}

export default App;
