import { useEffect, useState, useCallback } from 'react';
import { FetchOptions, METHOD } from './type';
import { callApiAsync } from './helper';
import { z } from 'zod';

/**
 * Custom hook for fetching data from an API or via a provided function with Zod validation
 *
 * @param param - Either a URL string to fetch from, or a function that returns a Promise
 * @param schema - Optional Zod schema to validate and parse the response data
 * @param method - The HTTP method to use for the request (GET, POST, etc.)
 * @param options - Additional options for the API call (headers, body, etc.)
 * @returns {Object} An object containing:
 *   - data: The fetched and validated data or null if not yet loaded
 *   - loading: Boolean indicating if the request is in progress
 *   - error: Error message if the request failed or validation failed, otherwise null
 *   - refetch: Function to manually trigger a refetch of the data
 */
function useFetch<T, Z = T>(
  param: string | (() => Promise<unknown>),
  selector?: Function, // selector param, a callback to select param from server response data, currently not apply if param === 'function'
  schema?: z.ZodType<Z>,
  options?: FetchOptions,
) {
  const [data, setData] = useState<Z | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let rawData: unknown;

      if (typeof param === 'string') {
        const result = await callApiAsync(param, 'GET', options);
        rawData = result.data;
        if(selector) rawData = selector(rawData); // apply in here to select customized param
      } else if (typeof param === 'function') {
        rawData = await param();
      } else {
        throw new Error('Invalid parameter: must be a URL string or a function');
      }

      // Apply Zod validation if schema is provided
      if (schema) {
        try {
          const validatedData = schema.parse(rawData);
          setData(validatedData);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            throw new Error(
              `Validation error: ${validationError.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
            );
          }
          throw validationError;
        }
      } else {
        // If no schema provided, cast the data as Z
        setData(rawData as Z);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [param, schema, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, loading, error, refetch: fetchData };
}

export default useFetch;
