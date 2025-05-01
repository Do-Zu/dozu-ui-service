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
const DEFAULT_TIMEOUT_MS = 60000 * 2; // 2 minutes

export function useEventSource<T>(url: string | null, options: EventSourceOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'open' | 'closed' | 'error' | 'timeout' | 'completed'
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
      console.error('EventSource error:', error);
      setStatus('closed');
      eventSource.close();
      clearTimeout(timeoutId);
    };

    eventSource.onmessage = (event) => {
      try {
        console.log('Received SSE data:', event);

        const parsedData = JSON.parse(event.data);

        if (parsedData) {
          setData(parsedData);
        }

        if (parsedData?.status === 'completed') {
          setStatus('completed');
          clearTimeout(timeoutId);
          setTimeout(() => {
            eventSource.close();
          }, 1000);
        } else if (parsedData?.status === 'error') {
          setStatus('error');
          clearTimeout(timeoutId);
          eventSource.close();
        }

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
