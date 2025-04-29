'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
// import { motion } from "framer-motion"

import React, { useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { callApiAsync } from '@/hooks/helper';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { updateAccessToken } from '@/stores/features/auth/authSlice';

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

const googleOAuthURL =
  'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=http://localhost:3333/api/auth/google&client_id=960283004591-j93njbhcdi2etnm4t4mqjddk6im52cn4.apps.googleusercontent.com'; //todo:change to using .env

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const dispatch = useAppDispatch();

  const t = useTranslations('LoginPage');
  const param = '/auth/login';
  const { data: apiData, error, loading, refetch } = useFetch<ApiResponse>(param);
  const login = async () => {
    const options: any = {};
    options.body = {
      username: email,
      password: password,
    };
    const response = await callApiAsync('/auth/login', 'POST', options); //todo:changes to useQuery
    dispatch(updateAccessToken(response.data.accessToken));
  };

  console.log(accessToken);

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
            <a href="#" className="underline">
              {t('signUpButtonText')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
