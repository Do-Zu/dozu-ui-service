export interface FetchOptions {
    headers?: Record<string, string>;
    body?: string;
  }

export type METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IProcessingFetching<T> {
    data: T[];
    loading: boolean;
    error: string | null;
  };