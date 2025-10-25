export type APIResponseStatus = 'success' | 'created' | 'accepted';  

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  status: APIResponseStatus;
}

export interface ApiError {
  code: number;
  message: string;
  status: string;
}
