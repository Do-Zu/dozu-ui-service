import { AxiosRequestConfig } from 'axios';
import Axios from '@/api/axios';
import { FetchOptions, METHOD, Param } from './type';

/**
 * Makes an API call using the configured Axios instance
 * @param url API endpoint path
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param options Request options (headers, params, body)
 * @returns Promise with the API response
 */
export const callApiAsync = async <T = any>(
  url: string,
  method: METHOD = 'GET',
  options?: FetchOptions | Param,
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: url.startsWith('/') ? url : `/${url}`,
      headers: options?.headers,
    };

    if (method === 'GET' && options && 'params' in options) {
      config.params = options?.params;
    } else if (options && 'body' in options) {
      switch (method) {
        case 'POST':
        case 'PUT':
        case 'DELETE':
          config.data = options?.body;
          break;
      }
    }

    const response = await Axios(config);

    return response?.data;
  } catch (error) {
    throw error;
  }
};
