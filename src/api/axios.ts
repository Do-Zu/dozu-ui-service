import axios from 'axios';
import { openUpgradeModal } from '@/stores/features/subscription/subscriptionUtils';
import { getTimestampWithClientOffset, isEmpty } from '@/utils';
import { getCurrentPlanUser, normalizeUrl } from '@/utils/auth/subscription';
import { ROUTES } from '@/utils/constants/routes';
import toastHelper from '@/utils/toast.helper';

const BASE_URL_MAI_API = process.env.NEXT_PUBLIC_API_URL;

const Axios = axios.create({
    baseURL: `${BASE_URL_MAI_API}/api`,
    // attach headers in requestInterceptor later
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});

Axios.defaults.withCredentials = true;

const RefreshTokenAxiosClient = axios.create({
    baseURL: `${BASE_URL_MAI_API}/api`,
    // attach headers in requestInterceptor later
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});
RefreshTokenAxiosClient.defaults.withCredentials = true;

const fallBackToken = () => {
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('isLoggedIn');
    window.location.href = ROUTES.LOGIN;
};
// Request Interceptor
const requestInterceptor = Axios.interceptors.request.use(
    async (config) => {
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        // If the user is authenticated, attach the token to the request
        const userString = localStorage.getItem('user'); //get user object saved in localStorage

        if (userString) {
            const userObject = JSON.parse(userString);
            const accessToken = userObject?.accessToken;
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const { timestamp, timezone } = getTimestampWithClientOffset();

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

        // You can transform the response here if needed, e.g., formatting data globally
        // For example, you can transform all response data to lowercase if required
        // response.data = response.data.toLowerCase();

        return response;
    },
    async (error) => {
        // Global Error Handling: Catch specific error status codes and handle them
        const originalRequest = error.config;
        if (error.response) {
            // Handle errors based on HTTP status codes (e.g., 401 Unauthorized, 500 Server Error)
            if (error.response.status === 401 && !originalRequest._retry) {
                //checks if already retried
                originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
                try {
                    const response = await RefreshTokenAxiosClient.post('/auth/refresh-token');

                    if (response?.data?.data?.user && response?.data?.data?.accessToken) {
                        window.localStorage.setItem(
                            'user',
                            JSON.stringify({ ...response.data.data.user, accessToken: response.data.data.accessToken }),
                        );

                        window.localStorage.setItem('isLoggedIn', 'true');
                    } else {
                        toastHelper.showLog('Incomplete refresh response:', response?.data);
                        fallBackToken();
                        return Promise.reject(new Error('Incomplete refresh response'));
                    }

                    // Axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
                    return Axios(originalRequest); // Retry the original request with the new access token.

                    //set new user data and accessToken
                } catch (refreshTokenError) {
                    try {
                        fallBackToken();
                    } catch (localStorageError) {
                        toastHelper.showLog(localStorageError);
                    }

                    toastHelper.showLog(refreshTokenError);

                    return Promise.reject(refreshTokenError);
                }

                //handles refresh token logic
                // Redirect to login page or show login modal
            } else if (error.response.status === 500) {
                console.error('Server error occurred. Please try again later.');
            } else if (error.response.status === 402) {
                console.error("Payment required - User's plan may have expired or is not valid.");
                openUpgradeModal();
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
