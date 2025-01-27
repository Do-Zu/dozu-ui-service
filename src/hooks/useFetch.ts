import { useEffect, useState } from 'react';
import { FetchOptions, METHOD } from './type';
import { callApiAsync } from './helper';

function useFetch<T>(
  param: string | (() => Promise<T>),
  method?: METHOD,
  options?: FetchOptions,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (typeof param === 'string') {
          const result = await callApiAsync(param, method, options);
          setData(result.data);
        } else if (typeof param === 'function') {
          const data = await param();
          setData(data);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [param, method, options]);

  return { data, loading, error };
}

export default useFetch;
