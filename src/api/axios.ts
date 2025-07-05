import axios from 'axios';
import { getTimestampWithClientOffset } from '@/utils';
import { getCurrentPlanUser } from '@/utils/auth/subscription';

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

        const { method, url } = config;

        if (['POST', 'PUT', 'PATCH'].includes(method?.toUpperCase() || '')) {
            const currentPlanUser = getCurrentPlanUser();

            if (currentPlanUser && currentPlanUser.features && url) {
                const matchingFeature = currentPlanUser?.features.find(
                    (feature) => feature?.apiUrl && url?.includes(feature.apiUrl),
                );

                if (config.data && matchingFeature) {
                    config.data = {
                        ...config.data,
                        featureId: matchingFeature.featureId,
                        planId: currentPlanUser.plan.planId,
                        featureType: matchingFeature.featureType,
                        url,
                    };
                }
            }
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
            } else if (error.response.status === 402) {
                console.log("Payment required - User's plan may have expired or is not valid.");
                //TODO: Handle logic for expired or invalid plan
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
