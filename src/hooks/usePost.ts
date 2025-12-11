import { z } from 'zod';
import { FetchOptions, METHOD } from './type';
import { useCallback, useState } from 'react';
import { callApiAsync } from './helper';
import { AxiosError } from 'axios';
import errorHelper from '@/utils/error.helper';

interface IResultPost<TReq = unknown, TRes = unknown> {
    loading: boolean;
    data: TRes | null;
    error: string | null;
    reset: () => void;
    execute: (payload: TReq) => Promise<TRes | null>;
}

export interface UsePostOptions<TReq, TRes> {
    requestSchema?: z.ZodType<TReq>;
    responseSchema?: z.ZodType<TRes>;
    requestOptions?: Omit<FetchOptions, 'params' | 'body'>;
    onMessageError?: () => void;
    onMessageSuccess?: () => void;
    onSuccess?: (data: TRes) => void | Promise<void>;
    onError?: (error: unknown) => void;
}

/**
 * Custom hook for sending data to an API with Zod validation for request and response
 *
 * @param url - The API endpoint URL
 * @param method - The HTTP method (POST, PUT, PATCH, DELETE)
 * @param options - Additional options
 * @param options.requestSchema - Optional Zod schema to validate request data
 * @param options.responseSchema - Optional Zod schema to validate and parse the response data
 * @param options.requestOptions - Optional Additional options for the API call (headers, etc.)
 * @param options.onMessageError - Optional Callback for showing error message 
 * @param options.onMessageSuccess - Optional Callback for showing success message
 * @param options.onError - Optional Callback that receives error object when there is an error
 * @param options.onSuccess - Optional Callback that receives data from response, used for updating UI  
 * @returns {Object} An object containing:
 *   - execute: Function to trigger the API call with payload
 *   - data: The response data (if any) after validation or null
 *   - loading: Boolean indicating if the request is in progress
 *   - error: Error message if the request failed or validation failed, otherwise null
 *   - reset: Function to reset the state (clear data, error and set loading to false)
 */
function usePost<TReq = unknown, TRes = unknown>(
    param: string | ((data: TReq) => Promise<unknown>),
    method: Extract<METHOD, 'POST' | 'PUT' | 'PATCH' | 'DELETE'> = 'POST',
    options?: UsePostOptions<TReq, TRes>,
): IResultPost<TReq, TRes> {
    const [data, setData] = useState<TRes | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    options = options || {};
    const { requestSchema, responseSchema, requestOptions, onMessageError, onMessageSuccess, onError, onSuccess } =
        options;

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    /**
     * @description Validates the request data against the provided Zod schema
     * @param payload - The data to send in the request body
     * @returns validated request data
     * @throws Error if the request data doesn't match the schema
     */
    const validateRequest = useCallback(
        (payload: unknown): TReq => {
            if (!requestSchema) {
                return payload as TReq;
            }

            try {
                return requestSchema.parse(payload);
            } catch (validationError) {
                if (validationError instanceof z.ZodError) {
                    throw new Error(
                        `Request validation error: ${validationError.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
                    );
                }
                throw validationError;
            }
        },
        [requestSchema],
    );

    /**
     * @description Calls the API with the provided function method
     * @param data - The data to send in the request body
     * @returns response data
     */
    const callWithFunctionFormat = useCallback(
        async (data: TReq): Promise<unknown> => {
            if (typeof param !== 'function') {
                throw new Error('Parameter is not a function');
            }

            return await param(data);
        },
        [param],
    );

    /**
     * @description Validates the response data against the provided Zod schema
     * @param responseData - The response data to validate
     * @throws Error if the response data doesn't match the schema
     * @returns validated response data
     */
    const validateResponse = useCallback(
        (responseData: unknown): TRes => {
            if (!responseSchema) {
                setData(responseData as TRes);
                return responseData as TRes;
            }

            try {
                const validatedData = responseSchema.parse(responseData);
                setData(validatedData);
                return validatedData;
            } catch (validationError) {
                if (validationError instanceof z.ZodError) {
                    throw new Error(
                        `Response validation error: ${validationError.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
                    );
                }
                throw validationError;
            }
        },
        [responseSchema],
    );

    /**
     * @description Executes the API call with the provided payload
     * @param payload - The data to send in the request body
     * @returns validated response data or null if an error occurred
     */
    const execute = useCallback(
        async (payload: TReq): Promise<TRes | null> => {
            try {
                setLoading(true);
                setError(null);

                // Validate request data if schema is provided
                // Skip validation if no payload or treat as empty object if undefined
                const validatedRequestData = payload !== undefined ? validateRequest(payload) : ({} as TReq);

                // Call the API
                let responseData: unknown;

                if (typeof param === 'function') {
                    // For function-based calls, we don't modify the payload as the function should handle that
                    responseData = await callWithFunctionFormat(validatedRequestData);
                } else {
                    // For URL-based calls, we use the callApiAsync which now adds timezone information
                    responseData = await callApiAsync(param.toString(), method, {
                        ...requestOptions,
                        body: validatedRequestData,
                    });
                }

                if (onMessageSuccess) {
                    onMessageSuccess();
                }

                // Validate response data if schema is provided
                const validatedResponse = validateResponse(responseData);

                // if onSuccess is passed, execute onSuccess with validatedResponse
                await onSuccess?.(validatedResponse);
                return validatedResponse;
            } catch (error) {
                const message = errorHelper.getErrorMessage(error);
                setError(message);

                if (onMessageError) {
                    onMessageError();
                }

                // if onError is passed, execute onError
                onError?.(error);

                return null;
            } finally {
                setLoading(false);
            }
        },
        [param, method, validateRequest, validateResponse, requestOptions],
    );

    return { execute, data, loading, error, reset };
}

export default usePost;
