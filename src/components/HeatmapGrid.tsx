import { CoinData } from '../types';
import { CoinTile } from './CoinTile';
import './HeatmapGrid.css';

interface HeatmapGridProps {
  coins: CoinData[];
  loading: boolean;
}

export const HeatmapGrid = ({ coins, loading }: HeatmapGridProps) => {
  if (loading && coins.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading crypto data...</p>
      </div>
    );
  }

  return (
    <div className="heatmap-grid">
      {coins.map((coin) => (
        <CoinTile key={coin.id} coin={coin} />
      ))}
    </div>
  );
};
