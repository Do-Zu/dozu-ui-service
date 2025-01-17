import axios, { AxiosRequestConfig } from 'axios';
import { FetchOptions, METHOD } from './type';

export const callApiAsync = async (
  url: string,
  method?: METHOD,
  options?: FetchOptions,
) => {
  const config: AxiosRequestConfig = {
    method: method || 'GET',
    url,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...(options?.body ? { data: options.body } : {}),
  };
  return await axios(config);
};
