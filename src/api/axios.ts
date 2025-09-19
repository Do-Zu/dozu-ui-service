import axios from 'axios';
import { openUpgradeModal } from '@/stores/features/subscription/subscriptionUtils';
import { getTimestampWithClientOffset } from '@/utils';
import { getCurrentPlanUser, normalizeUrl } from '@/utils/auth/subscription';
import { log } from 'console';

const Axios = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    // attach headers in requestInterceptor later
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});

Axios.defaults.withCredentials = true;

const RefreshTokenAxiosClient = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    // attach headers in requestInterceptor later
    // headers: {
    //     'Content-Type': 'application/json',
    // },
});
RefreshTokenAxiosClient.defaults.withCredentials = true;

// Request Interceptor
const requestInterceptor = Axios.interceptors.request.use(
    (config) => {
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

        const { method, url } = config;

        if (['POST', 'PUT', 'PATCH'].includes(method?.toUpperCase() || '')) {
            const currentPlanUser = getCurrentPlanUser();

            if (currentPlanUser && currentPlanUser.features && url) {
                const matchingFeature = currentPlanUser?.features.find(
                    (feature) => feature?.apiUrl && normalizeUrl(url) === normalizeUrl(feature.apiUrl),
                );

                if (config.data && matchingFeature) {
                    if (config.data instanceof FormData) {
                        config.data.append('featureId', matchingFeature.featureId.toString());
                        config.data.append('planId', currentPlanUser.plan.planId.toString());
                        config.data.append('featureType', matchingFeature.featureType);
                        config.data.append('url', url);
                    } else {
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
    async (error) => {
        // Global Error Handling: Catch specific error status codes and handle them
        const originalRequest = error.config;
        console.log(originalRequest);
        console.log(originalRequest._retry);
        if (error.response) {
            // Handle errors based on HTTP status codes (e.g., 401 Unauthorized, 500 Server Error)
            if (error.response.status === 401 && !originalRequest._retry) {
                console.log(error.response.status === 401);
                console.log(!originalRequest._retry);
                //checks if already retried
                console.log(originalRequest._retry);
                originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
                try {
                    const response = await RefreshTokenAxiosClient.post('/auth/refresh-token');
                    console.log('userdata', response.data);
                    console.log('response refresh', response.data.data.user);

                    window.localStorage.setItem(
                        'user',
                        JSON.stringify({ ...response.data.data.user, accessToken: response.data.data.accessToken }),
                    );
                    window.localStorage.setItem('isLoggedIn', 'true');
                    // Axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
                    return Axios(originalRequest); // Retry the original request with the new access token.

                    //set new user data and accessToken
                } catch (refreshTokenError) {
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
