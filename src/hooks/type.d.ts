export interface FetchOptions {
    headers?: Record<string, string>;
    body?: unknown;
  }
export interface Param {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
}

export type METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IProcessingFetching<T> {
    data: T[];
    loading: boolean;
    error: string | null;
  };