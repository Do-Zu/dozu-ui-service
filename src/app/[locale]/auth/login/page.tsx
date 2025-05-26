'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { callApiAsync } from '@/hooks/helper';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { updateAccessToken } from '@/stores/features/auth/authSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setCredentials } from '@/stores/features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';

interface ApiResponse {
  data: any[];
  project: {
    name: string;
    version: string;
    description: string;
  };
  architecture: {
    pattern: string;
    features: string[];
  };
  development: {
    setup: string;
    commands: {
      dev: string;
      build: string;
      start: string;
      lint: string;
      typecheck: string;
    };
  };
  apiGuide: {
    folderStructure: Record<string, string>;
    routingGuide: string;
    errorHandling: string;
    responseFormat: string;
    securityBestPractices: string[];
    exampleEndpoint: {
      path: string;
      method: string;
      controller: string;
      service: string;
      repository: string;
    };
  };
  deploymentOptions: {
    vercel: string;
    docker: string;
    traditional: string;
  };
  documentation: {
    swagger: string;
    readme: string;
  };
}

const googleOAuthURL = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL || ''; //todo: replace with actual error tolerant code

const AuthPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const dispatch = useAppDispatch();

  const t = useTranslations('LoginPage');
  const param = '/auth/login';

  const login = async () => {
    const options: any = {
      body: {
        username: email,
        password: password,
      },
    };

    try {
      const response = await callApiAsync('/auth/login', 'POST', options); //todo:changes to useQuery
      const { accessToken } = response.data;

      // Decode access token to extract userId
      const decoded: any = jwtDecode(accessToken);
      const userId = decoded.user.userId;
      const username = decoded.user.username;

      dispatch(
        setCredentials({
          accessToken,
          username,
          userId,
        }),
      );

      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      // TODO: Show error to user via toast or inline message
    }
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
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                // type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
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
            className="w-full"
            onClick={() => {
              login();
            }}
          >
            {t('loginButtonText')}
          </Button>
          <Button
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

export default AuthPage;
