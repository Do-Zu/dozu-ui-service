'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { withRouteGuard } from '@/components/guards/RouteGuard';

import { useLogin } from '../hooks/useLogin';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import LoadingPage from '@/app/loading';

const AuthPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const t = useTranslations('LoginPage');

  const { login, isLoading: isLoginLoading } = useLogin();
  const { googleAuthUrl, isLoading: isGoogleLoading } = useGoogleAuth();

  const handleInputChange =
    (field: 'username' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleLogin = () => {
    login(credentials);
  };

  const handleGoogleLogin = () => {
    window.location.href = googleAuthUrl;
  };

  const isLoading = isLoginLoading || isGoogleLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted px-4">
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 space-y-6">
          <LoginHeader title={t('title')} subtitle={t('loginText')} />

          <LoginForm
            credentials={credentials}
            onInputChange={handleInputChange}
            onSubmit={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            isLoading={isLoading}
            translations={{
              username: t('username'),
              password: t('password'),
              loginButton: t('loginButtonText'),
              googleButton: t('loginGoogleButtonText'),
            }}
          />

          <LoginFooter noAccountText={t('noAccountPrompt')} signUpText={t('signUpButtonText')} />
        </CardContent>
      </Card>
    </div>
  );
};

const LoginHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="text-center">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <p className="text-muted-foreground text-sm">{subtitle}</p>
  </div>
);

interface LoginFormProps {
  credentials: { username: string; password: string };
  onInputChange: (
    field: 'username' | 'password',
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onGoogleLogin: () => void;
  isLoading: boolean;
  translations: {
    username: string;
    password: string;
    loginButton: string;
    googleButton: string;
  };
}

const LoginForm: React.FC<LoginFormProps> = ({
  credentials,
  onInputChange,
  onSubmit,
  onGoogleLogin,
  isLoading,
  translations,
}) => (
  <>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">{translations.username}</Label>
        <Input
          id="username"
          placeholder="username"
          required
          value={credentials.username}
          onChange={onInputChange('username')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{translations.password}</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={credentials.password}
          onChange={onInputChange('password')}
        />
      </div>
    </div>

    <Button disabled={isLoading} className="w-full" onClick={onSubmit}>
      {translations.loginButton}
    </Button>

    <Button disabled={isLoading} className="w-full" onClick={onGoogleLogin}>
      {translations.googleButton}
    </Button>
  </>
);

const LoginFooter: React.FC<{ noAccountText: string; signUpText: string }> = ({
  noAccountText,
  signUpText,
}) => (
  <div className="text-center text-sm text-muted-foreground">
    {noAccountText}{' '}
    <Link href="/auth/register" className="underline">
      {signUpText}
    </Link>
  </div>
);

export default withRouteGuard(AuthPage);
