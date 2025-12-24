import { useCallback, useEffect, useRef, useState } from 'react';
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';
interface EventSourceOptions<TRes> {
    method: string;
    onOpen?: () => void;
    onError?: (error: Event) => void;
    onMessage?: (data: TRes) => void;
    withCredentials?: boolean;
    timeoutMs?: number;
    onTimeout?: () => void;
    startEvent?: () => void;
    endEvent?: () => void;
}
const BASE_URL = `${process.env.NEXT_PUBLIC_API_STREAM_SSE_URL}/api`;
// const DEFAULT_TIMEOUT_MS = 2 * 60000; // 5 minutes
export type EventSourceStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'timeout' | 'error' | 'completed';

class RetirableError extends Error {}
class FatalError extends Error {}

export function useEventSourceStream<TReq, TRes>(
    url: string | null,
    options: EventSourceOptions<TRes> = { method: 'POST' },
) {
    const { user } = useAuthStorage();

    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const [data, setData] = useState<TRes | null>(null);
    const [status, setStatus] = useState<EventSourceStatus>('idle');

    // const timeoutMs = useMemo(() => {
    //     return options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    // }, [options?.timeoutMs]);

    const abortControllerRef = useRef<AbortController | null>(null);

    const handleEventMessage = useCallback(
        (data: string) => {
            try {
                const parsedData = JSON.parse(data);

                if (parsedData) {
                    setData(parsedData);
                }

                if (parsedData?.status === 'completed') {
                    setStatus('completed');
                    abortControllerRef.current?.abort();
                } else if (parsedData?.status === 'error') {
                    setStatus('error');
                    abortControllerRef.current?.abort();
                }

                if (options.onMessage) options.onMessage(parsedData);
            } catch (error) {
                console.error('Failed to parse SSE data:', error);
            }
        },
        [abortControllerRef, options],
    );

    const execute = useCallback(
        async (payload: TReq) => {
            // Cleanup previous connection if exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }

            if (!url) {
                setStatus('idle');
                return;
            }

            setStatus('connecting');

            fetchEventSource(`${BASE_URL}${url}`, {
                method: options.method,
                body: JSON.stringify(payload),
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Authorization: `Bearer ${user?.accessToken}`,
                },

                signal: abortControllerRef.current.signal,

                async onopen(response) {
                    if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
                        return; // everything's good
                    } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                        // client-side errors are usually non-retriable:
                        throw new FatalError();
                    } else {
                        return;
                    }
                },
                onmessage(msg) {
                    // if the server emits an error message, throw an exception
                    // so it gets handled by the onerror callback below:

                    handleEventMessage(msg.data);

                    if (msg.event === 'FatalError') {
                        throw new FatalError(msg.data);
                    }
                },
                onclose() {
                    setStatus((prev) => (prev === 'connecting' ? 'closed' : prev));
                },
                onerror(err) {
                    if (err instanceof FatalError) {
                        throw err; // rethrow to stop the operation
                    } else {
                        // do nothing to automatically retry. You can also
                        // return a specific retry interval here.
                    }
                },
            });
        },
        [url, options, user?.accessToken, handleEventMessage],
    );

    useEffect(() => {
        return () => {
            setStatus('closed');
            abortControllerRef.current?.abort();
        };
    }, []);

    return { execute, data, status };
}
