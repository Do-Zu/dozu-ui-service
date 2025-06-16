'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Axios from '@/api/axios';
import { toast } from '@/hooks/use-toast';
import { ROUTES } from '@/utils/constants/routes';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { User } from '@/types/auth';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useSearchParams } from 'next/navigation';
import { withRouteGuard } from '@/components/guards/RouteGuard';

const googleGoogleRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const googleOAuthClientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile%20https://www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code
&redirect_uri=${googleGoogleRedirectUri}&client_id=${googleOAuthClientId}`;

const AuthPage: React.FC = () => {
  // const searchParams = useSearchParams();

  // const search = searchParams.get('search')
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { handlePostLogin } = useAuthNavigation();

  const t = useTranslations('LoginPage');
  const param = '/auth/login';

  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const { setAuthData } = useAuth();
  useEffect(() => {
    const options: any = {
      body: {
        code: code,
      },
    };
    const loginGoogle = async () => {
      const response = await Axios.post('/auth/google', options.body, {
        withCredentials: true,
      });
      const userData = response.data.data;
      handleSuccessfulLogin(userData);
    };
    if (code) {
      loginGoogle(); //login if there is a code in url query (redirect from google oauth)
    }
  }, []);

  const handleSuccessfulLogin = (user: User) => {
    setAuthData(user);

    // Get the redirect parameter from URL
    const redirectTo = searchParams?.get('redirect');

    if (redirectTo) {
      const decodedPath = decodeURIComponent(redirectTo);
      // The handlePostLogin will now create a redirect chain if needed
      handlePostLogin(user, decodedPath);
    } else {
      // No specific redirect, let the system determine the flow
      handlePostLogin(user);
    }
  };

  const login = async () => {
    const options: any = {
      body: {
        username: username,
        password: password,
      },
    };

    try {
      setIsLoading(true);
      // const response = await callApiAsync('/auth/login', 'POST', options); //todo:changes to useQuery
      const response = await Axios.post('/auth/login', options.body, {
        withCredentials: true,
      });

      //[Q&A]: shouldn't decode access token at client side
      // const decoded: any = jwtDecode(accessToken);
      // const userId = decoded.user.userId;
      // const username = decoded.user.username;

      //TODO: replace sample user data after login for real

      const userData = response.data.data;
      //follows this structure
      // const userData = {
      //   id: '1',
      //   email: 'v@gmail.com',
      //   name: 'pernist',
      //   roles: ['user'],
      //   permissions: [],
      //   isNewUser: false,
      //   hasCompletedOnboarding: false,
      //   lastLoginAt: new Date().toISOString(),
      //   accessToken,
      // };

      handleSuccessfulLogin(userData);
    } catch (error) {
      toast({
        description: t('loginErrorMessage'),
        variant: 'destructive',
      });
      router.push(ROUTES.HOME);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted px-4">
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">{t('loginText')}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                // type="email"
                placeholder="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
          </div>
          <Button
            disabled={isLoading}
            className="w-full"
            onClick={() => {
              login();
            }}
          >
            {t('loginButtonText')}
          </Button>
          <Button
            disabled={isLoading}
            className="w-full"
            onClick={() => {
              window.location.href = googleOAuthURL;
            }}
          >
            {t('loginGoogleButtonText')}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {t('noAccountPrompt')}{' '}
            <Link href="/auth/register" className="underline">
              {t('signUpButtonText')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRouteGuard(AuthPage);
