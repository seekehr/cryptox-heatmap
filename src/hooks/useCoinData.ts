import { useState, useEffect, useCallback, useRef } from 'react';
import { CoinData, ApiError } from '../types';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds
const RATE_LIMIT_BACKOFF = 60000; // 1 minute backoff on rate limit

interface UseCoinDataOptions {
  pollInterval?: number;
  coinCount?: number;
}

export const useCoinData = (options: UseCoinDataOptions = {}) => {
  const { pollInterval = DEFAULT_POLL_INTERVAL, coinCount = 50 } = options;

  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextPollDelay, setNextPollDelay] = useState<number>(pollInterval);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCoins = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: coinCount.toString(),
        page: '1',
        sparkline: 'false',
      });

      const response = await fetch(`${COINGECKO_API_URL}?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - back off
          setNextPollDelay(RATE_LIMIT_BACKOFF);
          throw new Error('Rate limit exceeded. Backing off...');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: CoinData[] = await response.json();
      setCoins(data);
      setError(null);
      setLastUpdate(new Date());
      setLoading(false);

      // Reset to normal poll interval on success
      if (nextPollDelay !== pollInterval) {
        setNextPollDelay(pollInterval);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        setError({ message: err.message });
      } else {
        setError({ message: 'Unknown error occurred' });
      }
      setLoading(false);
    }
  }, [coinCount, pollInterval, nextPollDelay]);

  useEffect(() => {
    // Initial fetch
    fetchCoins();

    // Set up polling
    const intervalId = setInterval(fetchCoins, nextPollDelay);

    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCoins, nextPollDelay]);

  return {
    coins,
    loading,
    error,
    lastUpdate,
    refetch: fetchCoins,
  };
};
