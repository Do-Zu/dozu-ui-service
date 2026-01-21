'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { withRouteGuard } from '@/components/guards/RouteGuard';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import CentralCard from '@/components/auth/CentralCard';
import { Mail, UserPlus } from 'lucide-react';
import toastHelper from '@/utils/toast.helper';
import { ROUTES } from '@/utils/constants/routes';

const ROLE_DEFAULT = 'user';
const API_END_POINT = '/auth/register';

const RegisterPage = () => {
    const t = useTranslations('RegisterPage');
    const router = useRouter();

    const { googleAuthUrl } = useGoogleAuth();
    const handleGoogleLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the default form submission behavior
        if (event) {
            event.preventDefault();
        }
        window.location.href = googleAuthUrl;
    };

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const body = { username: username, email: email, password: password, role: ROLE_DEFAULT };
    const { loading, error: apiPostContentError, execute } = usePost<unknown, unknown>(API_END_POINT);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await execute(body);
            toastHelper.showSuccessMessage(t('registerSuccessMessage'));
            router.push(ROUTES.LOGIN);
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Login error:', err);
            }
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
        <CentralCard>
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-bold">{t('title')}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">{t('subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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

                    <Button
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2 text-base font-medium"
                    >
                        <UserPlus />
                        {loading ? t('registerButtonTextLoading') : t('registerButtonText')}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2 text-base font-medium"
                        onClick={handleGoogleLogin}
                    >
                        <Mail className="size-5" />
                        {t('registerGoogleButtonText')}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    {t('haveAccountPrompt')}{' '}
                    <Link href={ROUTES.LOGIN} className="underline">
                        {t('loginButtonText')}
                    </Link>
                </div>
            </CardContent>
        </CentralCard>
    );
};

export default withRouteGuard(RegisterPage);
