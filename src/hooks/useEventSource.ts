import { useEffect, useState } from 'react';

interface EventSourceOptions {
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  withCredentials?: boolean;
  timeoutMs?: number;
  onTimeout?: () => void;
}
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const DEFAULT_TIMEOUT_MS = 30000;

export function useEventSource<T>(url: string | null, options: EventSourceOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'open' | 'closed' | 'error' | 'timeout'
  >('idle');

  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return;
    }

    setStatus('connecting');
    const eventSource = new EventSource(`${BASE_URL}${url}`, {
      withCredentials: options?.withCredentials || false,
    });

    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const timeoutId = setTimeout(() => {
      setStatus('timeout');
      eventSource.close();
      if (options.onTimeout) options.onTimeout();
    }, timeoutMs);

    eventSource.onopen = () => {
      setStatus('open');
      if (options.onOpen) options.onOpen();
    };

    eventSource.onerror = (error) => {
      setStatus('error');
      if (options.onError) options.onError(error);
      eventSource.close();
      clearTimeout(timeoutId);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        if (options.onMessage) options.onMessage(event);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    return () => {
      eventSource.close();
      setStatus('closed');
      clearTimeout(timeoutId);
    };
  }, [url, options?.withCredentials, options?.timeoutMs]);

  return { data, status };
}
