'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import usePost from '@/hooks/usePost';

import {  useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { withRouteGuard } from '@/components/guards/RouteGuard';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { User } from '@/types/auth';

const RegisterPage = () => {
    const { setAuthData } = useAuth();
    const { handlePostLogin } = useAuthNavigation();
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

    const { googleAuthUrl } = useGoogleAuth();
    const handleGoogleLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the default form submission behavior
        if (event) {
            event.preventDefault();
        }
        window.location.href = googleAuthUrl;
    };

    const t = useTranslations('RegisterPage');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const body = { username: username, email: email, password: password };
    const {
        loading,
        data: apiResponse,
        error: apiPostContentError,
        execute,
    } = usePost<any, any>('/auth/register', 'POST');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await execute(body);

            console.log(result.data);
            handleSuccessfulLogin(result.data);

        } catch (err) {
            console.error('Login error:', err);
        }
    };

    if (apiPostContentError) {
        toast({
            title: 'Something went wrong',
            description: 'Please try again',
        });
    }

    //todo:check in again with the usePost types

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-muted px-4">
            <div className="w-full max-w-md">
                <Card className="rounded-2xl shadow-md">
                    <CardContent className="p-6 space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold">{t('title')}</h1>
                            <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">{t('username')}</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder={t('username')}
                                    required
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                    title="Please enter a valid email address"
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
                                    placeholder="Create a password"
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </div>
                            <Button disabled={loading} className="w-full">
                                {loading ? t('registerButtonTextLoading') : t('registerButtonText')}
                            </Button>
                            <Button disabled={loading} className="w-full" onClick={handleGoogleLogin}>
                                {t('registerGoogleButtonText')}{' '}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('haveAccountPrompt')}{' '}
                            <Link href="/auth/login" className="underline">
                                {t('loginButtonText')}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default withRouteGuard(RegisterPage);
