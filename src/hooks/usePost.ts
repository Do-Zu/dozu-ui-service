import { z } from 'zod';
import { FetchOptions, METHOD } from './type';
import { useCallback, useState } from 'react';
import { callApiAsync } from './helper';

/**
 * Custom hook for sending data to an API with Zod validation for request and response
 *
 * @param url - The API endpoint URL
 * @param method - The HTTP method (POST, PUT, PATCH, DELETE)
 * @param requestSchema - Optional Zod schema to validate request data
 * @param responseSchema - Optional Zod schema to validate and parse the response data
 * @param options - Additional options for the API call (headers, etc.)
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
  requestSchema?: z.ZodType<TReq>,
  responseSchema?: z.ZodType<TRes>,
  options?: Omit<FetchOptions, 'params' | 'body'>,
) {
  const [data, setData] = useState<TRes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        const validatedRequestData =
          payload !== undefined ? validateRequest(payload) : ({} as TReq);

        // Call the API
        let responseData: unknown;

        if (typeof param === 'function') {
          responseData = await callWithFunctionFormat(validatedRequestData);
        } else {
          responseData = await callApiAsync(param.toString(), method, {
            ...options,
            body: validatedRequestData,
          });
        }

        // Validate response data if schema is provided
        return validateResponse(responseData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [param, method, validateRequest, validateResponse, options],
  );

  return { execute, data, loading, error, reset };
}

export default usePost;
