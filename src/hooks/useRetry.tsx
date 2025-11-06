'use client';

import { useCallback, useState } from 'react';

interface IUserRetryProps<T, TArgs extends unknown[] = unknown[]> {
    retry: (...args: TArgs) => Promise<T>;
    options?: {
        maxRetries?: number;
        delay?: number;
        onSuccess?: () => void;
        onFailureEachTry?: (error: unknown) => void;
        onFailure?: (error: unknown) => void;
        onStop?: (error: unknown) => boolean;
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
export default function useRetry<T, TArgs extends unknown[] = unknown[]>({
    retry,
    options,
}: IUserRetryProps<T, TArgs>) {
    const {
        maxRetries = DEFAULT_MAX_RETRIES,
        delay = DEFAULT_DELAY,
        onSuccess,
        onFailure,
        onFailureEachTry,
        onStop,
    } = options || {};

    const execute = useCallback(
        async (...args: TArgs) => {
            let lastError: unknown = null;
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const result = await retry(...args);
                    onSuccess?.();
                    return result;
                } catch (error) {
                    if (onStop?.(error)) {
                        return lastError;
                    }
                    onFailureEachTry?.(error);
                    lastError = error;
                    if (attempt < maxRetries - 1) {
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                }
            }

            onFailure?.(lastError);
            throw lastError instanceof Error ? lastError : new Error('Retry failed');
        },
        [retry, maxRetries, delay, onSuccess, onFailureEachTry, onFailure],
    );

    return { execute };
}
