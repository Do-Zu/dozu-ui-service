'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Loader2, LogIn, Mail } from 'lucide-react';

import React, { useState } from 'react';
import Link from 'next/link';
import { withRouteGuard } from '@/components/guards/RouteGuard';

import { useLogin } from '../hooks/useLogin';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import LoadingPage from '@/app/loading';
import { useRouter } from 'next/navigation';
import CentralCard from '@/components/auth/CentralCard';

const AuthPage: React.FC = () => {
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });

    const t = useTranslations('LoginPage');

    const { login, isLoading: isLoginLoading } = useLogin();
    const { googleAuthUrl, isLoading: isGoogleLoading } = useGoogleAuth();

    const handleInputChange = (field: 'username' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleLogin = () => login(credentials);
    const handleGoogleLogin = () => (window.location.href = googleAuthUrl);
    const handleForgetPassword = () => {
        router.push(`/auth/forgotPassword`);
    };

    const isLoading = isLoginLoading || isGoogleLoading;

    if (isLoading) return <LoadingPage />;

    return (
        <CentralCard>
            <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold">{t('title')}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">{t('loginText')}</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                <LoginForm
                    credentials={credentials}
                    onInputChange={handleInputChange}
                    onSubmit={handleLogin}
                    onGoogleLogin={handleGoogleLogin}
                    onForgetPassword={handleForgetPassword}
                    isLoading={isLoading}
                    translations={{
                        username: t('username'),
                        password: t('password'),
                        loginButton: t('loginButtonText'),
                        googleButton: t('loginGoogleButtonText'),
                        forgotPasswordText: t('forgotPasswordText'),
                    }}
                />

                <LoginFooter
                    noAccountText={t('noAccountPrompt')}
                    signUpText={t('signUpButtonText')}
                    useAsGuestText={t('useAsGuestText')}
                />
            </CardContent>
        </CentralCard>
    );
};

interface LoginFormProps {
    credentials: { username: string; password: string };
    onInputChange: (field: 'username' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onGoogleLogin: () => void;
    onForgetPassword: () => void;
    isLoading: boolean;
    translations: {
        username: string;
        password: string;
        loginButton: string;
        googleButton: string;
        forgotPasswordText: string;
    };
}

const LoginForm: React.FC<LoginFormProps> = ({
    credentials,
    onInputChange,
    onSubmit,
    onGoogleLogin,
    onForgetPassword,
    isLoading,
    translations,
}) => (
    <form
        className="space-y-5"
        onSubmit={(e) => {
            e.preventDefault(); // prevent page reload
            onSubmit();
        }}
    >
        <div className="space-y-5">
            <div className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="username" className="text-sm font-medium">
                        {translations.username}
                    </Label>
                    <Input
                        id="username"
                        placeholder="yourname123"
                        required
                        className="h-12 text-base"
                        value={credentials.username}
                        onChange={onInputChange('username')}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm font-medium">
                        {translations.password}
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="h-12 text-base"
                        value={credentials.password}
                        onChange={onInputChange('password')}
                    />
                </div>
            </div>

            <Button
                disabled={isLoading}
                className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
                onClick={onSubmit}
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                {translations.loginButton}
            </Button>

            <Button
                variant="outline"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
                onClick={onGoogleLogin}
            >
                <Mail className="h-5 w-5" />
                {translations.googleButton}
            </Button>
            <div className="flex justify-end">
                <Button className="text-sm text-muted-foreground" variant="link" onClick={onForgetPassword}>
                    {translations.forgotPasswordText}
                </Button>
            </div>
        </div>
    </form>
);

const LoginFooter: React.FC<{ noAccountText: string; signUpText: string; useAsGuestText: string }> = ({
    noAccountText,
    signUpText,
    useAsGuestText,
}) => (
    <>
        <p className="text-center text-sm text-muted-foreground">
            {noAccountText}{' '}
            <Link href="/auth/register" className="font-medium underline hover:text-primary">
                {signUpText}
            </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
            <Link href="/home" className="font-medium underline hover:text-primary">
                {useAsGuestText}
            </Link>
        </p>
    </>
);

export default withRouteGuard(AuthPage);
