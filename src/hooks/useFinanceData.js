import { useState, useCallback, useRef, useEffect } from 'react';
import { DATA_URL } from '../config';

const FALLBACK_URL = './sample-data.json';

export function useFinanceData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      let res = await fetch(`${DATA_URL}?t=${Date.now()}`);
      if (!res.ok) {
        res = await fetch(`${FALLBACK_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error(`Failed to fetch data (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (!json || typeof json !== 'object') throw new Error('Invalid data format');
      setData(json);
      setLastFetched(new Date().toISOString());
    } catch (err) {
      setError(err.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, lastFetched, refresh: fetchData };
}
