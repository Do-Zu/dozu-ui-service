import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import Axios from '@/api/axios';
import { toast } from '@/hooks/use-toast';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { useAuth } from '@/contexts/auth/AuthContext';
import { User } from '@/types/auth';

interface LoginCredentials {
  username: string;
  password: string;
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { handlePostLogin } = useAuthNavigation();
  const { setAuthData } = useAuth();
  const t = useTranslations('LoginPage');
  const searchParams = useSearchParams();

  const handleSuccessfulLogin = (user: User) => {
    setAuthData(user);

    const redirectTo = searchParams?.get('redirect');

    if (redirectTo) {
      const decodedPath = decodeURIComponent(redirectTo);
      handlePostLogin(user, decodedPath);
    } else {
      handlePostLogin(user);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      const response = await Axios.post('/auth/login', credentials, {
        withCredentials: true,
      });

      const userData = response.data.data;
      handleSuccessfulLogin(userData);
    } catch (error) {
      toast({
        description: t('loginErrorMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
};
