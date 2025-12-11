import { CoinData } from '../types';
import './CoinTile.css';

interface CoinTileProps {
  coin: CoinData;
}

const getColorClass = (priceChange: number): string => {
  if (priceChange >= 5) return 'strong-gain';
  if (priceChange >= 1) return 'gain';
  if (priceChange <= -5) return 'strong-loss';
  if (priceChange <= -1) return 'loss';
  return 'neutral';
};

export const CoinTile = ({ coin }: CoinTileProps) => {
  const colorClass = getColorClass(coin.price_change_percentage_24h);
  const priceChangeAbs = Math.abs(coin.price_change_percentage_24h);

  return (
    <div className={`coin-tile ${colorClass}`}>
      <div className="coin-header">
        <img src={coin.image} alt={coin.name} className="coin-image" />
        <div className="coin-info">
          <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
          <span className="coin-rank">#{coin.market_cap_rank}</span>
        </div>
      </div>
      <div className="coin-price">
        ${coin.current_price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: coin.current_price < 1 ? 6 : 2,
        })}
      </div>
      <div className="coin-change">
        <span className={coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
          {coin.price_change_percentage_24h >= 0 ? '+' : '-'}
          {priceChangeAbs.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
