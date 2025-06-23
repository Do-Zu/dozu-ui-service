export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  status: string;
}

export interface ApiError {
  code: number;
  message: string;
  status: string;
}
