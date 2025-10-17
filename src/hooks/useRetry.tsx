'use client';

import { useCallback, useState } from 'react';

interface IUserRetryProps<T> {
    retry: (...args: unknown[]) => Promise<T>;
    options?: {
        maxRetries?: number;
        delay?: number;
        onSuccess?: () => void;
        onFailureEachTry?: (error: unknown) => void;
        onFailure?: (error: unknown) => void;
    };
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_DELAY = 1000;

/**
 *
 * A custom hook to retry a function upon failure.
 * @param   retry - The function to be retried.
 * @param   options - Configuration options for retry behavior.
 * @returns  function for execute
 */
export default function useRetry<T>({ retry, options }: IUserRetryProps<T>) {
    const {
        maxRetries = DEFAULT_MAX_RETRIES,
        delay = DEFAULT_DELAY,
        onSuccess,
        onFailure,
        onFailureEachTry,
    } = options || {};

    const [error, setError] = useState<unknown | null>(null);

    const execute = useCallback(
        async (...args: T[]) => {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const result = await retry(...args);
                    onSuccess?.();
                    setError(null);
                    return result;
                } catch (error) {
                    onFailureEachTry?.(error);
                    setError(error);
                    if (attempt < maxRetries - 1) {
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                }
            }

            if (error) {
                onFailure?.(error);
                throw error;
            }
        },
        [retry, maxRetries, delay, onSuccess, onFailureEachTry],
    );

    return { execute };
}
