import { useEffect, useState, useCallback, useRef } from 'react';
import { FetchOptions, METHOD } from './type';
import { callApiAsync } from './helper';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { isEmpty, isNilOrEmpty } from '@/utils';

/**
 * Custom hook for fetching data from an API or via a provided function with Zod validation
 *
 * @param param - Either a URL string to fetch from, or a function that returns a Promise
 * @param schema - Optional Zod schema to validate and parse the response data
 * @param selector - Selector param, a callback to select param from server response data, currently not apply if param === 'function'
 * @param options - Additional options for the API call (headers, body, etc.)
 * @returns {Object} An object containing:
 *   - data: The fetched and validated data or null if not yet loaded
 *   - loading: Boolean indicating if the request is in progress
 *   - error: Error message if the request failed or validation failed, otherwise null
 *   - refetch: Function to manually trigger a refetch of the data
 */

interface Options<Z> {
    selector?: Function;
    schema?: z.ZodType<Z>;
    shouldRun?: boolean | ((...args: any[]) => boolean);
    onSuccess?: (...args: any[]) => void;
    onError?: (...args: any[]) => void;
    onEmpty?: (...args: any[]) => void;
}

function useFetch<T, Z = T>(
    param: string | ((...args: any[]) => Promise<unknown>),
    options?: Options<Z>,
    fetchOptions?: FetchOptions,
) {
    const selector = options?.selector;
    const schema = options?.schema;
    const shouldRun = !isNilOrEmpty(options?.shouldRun) ? options?.shouldRun : true;

    const [data, setData] = useState<Z | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(
        async (...args: unknown[]) => {
            // Cancel any in-flight request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create a new abort controller for this request and store it in a local variable
            const currentController = new AbortController();
            abortControllerRef.current = currentController;

            try {
                setLoading(true);
                setError(null);

                let rawData: unknown;

                if (typeof param === 'string') {
                    const result = await callApiAsync(param, 'GET', fetchOptions);
                    rawData = result.data;
                } else if (typeof param === 'function') {
                    rawData = await param(...args);
                } else {
                    throw new Error('Invalid parameter: must be a URL string or a function');
                }

                // apply in here to select customized param
                if (selector && rawData) rawData = selector(rawData);

                let finalData: Z;

                // Apply Zod validation if schema is provided
                if (schema) {
                    try {
                        finalData = schema.parse(rawData);
                    } catch (validationError) {
                        if (validationError instanceof z.ZodError) {
                            throw new Error(
                                `Validation error: ${validationError.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
                            );
                        }
                        throw validationError;
                    }
                } else {
                    finalData = rawData as Z;
                }

                setData(finalData);

                if (isEmpty(finalData as unknown)) {
                    options?.onEmpty?.();
                } else {
                    options?.onSuccess?.(data);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                if (error instanceof AxiosError) {
                    setError(error.response?.data.message);
                } else {
                    setError(error instanceof Error ? error.message : 'Unknown error');
                }

                options?.onError?.(error);
            } finally {
                // Check the signal from our local controller variable
                if (!currentController.signal.aborted) {
                    setLoading(false);
                }
            }
        },
        [param, selector, schema, fetchOptions],
    );

    useEffect(() => {
        // only fetch data if shouldRun is true
        if (typeof shouldRun === 'function' && shouldRun()) {
            fetchData();
        } else if (typeof shouldRun === 'boolean' && shouldRun) {
            fetchData();
        } else {
            setLoading(false);
        }

        return () => {
            // Cancel any pending requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [shouldRun]);

    return { data, setData, loading, error, refetch: fetchData };
}

export default useFetch;
