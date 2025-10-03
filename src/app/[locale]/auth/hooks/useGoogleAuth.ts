import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Axios from '@/api/axios';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { useAuth } from '@/contexts/auth/AuthContext';
import { AuthState, User } from '@/types/auth';
import { createGoogleAuthUrl } from '../login/utils/googleAuth';
import toastHelper from '@/utils/toast.helper';

export const useGoogleAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [googleAuthUrl, setGoogleAuthUrl] = useState('');

    const { handlePostLogin } = useAuthNavigation();
    const { setAuthData } = useAuth();
    const searchParams = useSearchParams();

    const code = searchParams?.get('code');
    const redirectTo = searchParams?.get('redirect');

    // Initialize Google Auth URL
    useEffect(() => {
        const url = createGoogleAuthUrl(redirectTo);
        setGoogleAuthUrl(url);
    }, [redirectTo]);

    // Handle Google OAuth callback
    useEffect(() => {
        if (!code) return;

        const loginWithGoogle = async () => {
            try {
                setIsLoading(true);

                const response = await Axios.post(
                    '/auth/google',
                    { code },
                    {
                        withCredentials: true,
                    },
                );

                const userData = response?.data?.data;
                handleSuccessfulLogin(userData);
            } catch (error) {
                console.error('Google auth error:', error);
                toastHelper.showErrorMessage(error);
            } finally {
                setIsLoading(false);
            }
        };

        loginWithGoogle();
    }, [code]);

    const handleSuccessfulLogin = (authState: AuthState) => {
        setAuthData(authState.user!);

        handlePostLogin(authState.user!);
    };

    return {
        googleAuthUrl,
        isLoading,
    };
};
