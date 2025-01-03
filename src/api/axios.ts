import axios from 'axios';

const Axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Request Interceptor
Axios.interceptors.request.use(
  (config) => {
    // If the user is authenticated, attach the token to the request
    const token = localStorage.getItem('authToken'); // update position store access token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);
// Response Interceptor
Axios.interceptors.response.use(
  (response) => {
    // Optionally, log the response for debugging
    console.log('Response Received:', response);

    // You can transform the response here if needed, e.g., formatting data globally
    // For example, you can transform all response data to lowercase if required
    // response.data = response.data.toLowerCase();

    return response;
  },
  (error) => {
    // Global Error Handling: Catch specific error status codes and handle them
    if (error.response) {
      // Handle errors based on HTTP status codes (e.g., 401 Unauthorized, 500 Server Error)
      if (error.response.status === 401) {
        console.error('Unauthorized - Redirecting to login...');
        // Redirect to login page or show login modal
      } else if (error.response.status === 500) {
        console.error('Server error occurred. Please try again later.');
      } else {
        console.error(
          'API Error:',
          error.response.data.message || error.message,
        );
      }
    } else if (error.request) {
      // Network Error (Request was made, but no response received)
      console.error('Network Error: Unable to reach the server');
    } else {
      // General Error (Error during setup or something unexpected)
      console.error('Error in setup:', error.message);
    }

    // Optionally, show a user-friendly message or redirect user to another page
    // For example: Show an error notification

    return Promise.reject(error);
  },
);

export const clearInterceptors = () => {
  const requestInterceptor = Axios.interceptors.request.use((config) => config);
  const responseInterceptor = Axios.interceptors.response.use(
    (response) => response,
  );
  Axios.interceptors.request.eject(requestInterceptor);
  Axios.interceptors.response.eject(responseInterceptor);
};

export default Axios;
