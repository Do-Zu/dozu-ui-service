// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'The data provided is invalid.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
};

// Success notification utility
export const showSuccess = (message: string) => {
  // You can replace this with your preferred notification system
  console.log('Success:', message);
  // Example: toast.success(message);
};

// Error notification utility
export const showError = (message: string) => {
  // You can replace this with your preferred notification system
  console.error('Error:', message);
  // Example: toast.error(message);
};
