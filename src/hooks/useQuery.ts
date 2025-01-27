import { useEffect, useState } from 'react';
import { FetchOptions, METHOD } from './type';
import { callApiAsync } from './helper';

const useQuery = <T>(url: string, method?: METHOD, options?: FetchOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await callApiAsync(url, method, options);
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, options]);

  return { data, loading, error };
};

export default useQuery;
