import { useEffect, useState } from 'react';

interface EventSourceOptions {
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  withCredentials?: boolean;
}
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export function useEventSource<T>(url: string | null, options: EventSourceOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle');

  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return;
    }

    setStatus('connecting');
    const eventSource = new EventSource(`${BASE_URL}${url}`, {
      withCredentials: options?.withCredentials || false,
    });

    eventSource.onopen = () => {
      setStatus('open');
      if (options.onOpen) options.onOpen();
    };

    eventSource.onerror = (error) => {
      setStatus('error');
      if (options.onError) options.onError(error);
      eventSource.close();
    };

    eventSource.onmessage = (event) => {
      try {
        console.log({ event });
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
    };
  }, [url, options?.withCredentials]);

  return { data, status };
}
