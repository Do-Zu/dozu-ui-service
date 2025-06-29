import axios from 'axios';
import { store } from '@/stores/store'; // Import the store
import { getTimestampWithClientOffset } from '@/utils';

const Axios = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

Axios.defaults.withCredentials = true;

// Request Interceptor
const requestInterceptor = Axios.interceptors.request.use(
    (config) => {
        // If the user is authenticated, attach the token to the request
        const userString = localStorage.getItem('user'); //get user object saved in localStorage

        if (userString) {
            const userObject = JSON.parse(userString);
            const accessToken = userObject?.accessToken;
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const { timestamp, timezone } = getTimestampWithClientOffset();

        // Attach timestamp and timezone to the request headers
        config.headers['X-Timestamp'] = timestamp;
        config.headers['X-Timezone'] = timezone;

        return config;
    },
    (error) => {
        // Handle request error
        console.error('Request Error:', error);
        return Promise.reject(error);
    },
);

// Response Interceptor
const responseInterceptor = Axios.interceptors.response.use(
    (response) => {
        // Optionally, log the response for debugging
        // console.log('Response Received:', response);

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
                console.error('API Error:', error.response.data.message || error.message);
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
    Axios.interceptors.request.eject(requestInterceptor);
    Axios.interceptors.response.eject(responseInterceptor);
};

export default Axios;
