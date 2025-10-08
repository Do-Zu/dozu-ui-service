'use client';

import { Card, CardContent } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import usePost from '@/hooks/usePost';
import { authService, IVerifyEmailBody } from '@/services/auth/auth.service';
import { User } from '@/types/auth';
import toastHelper from '@/utils/toast.helper';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
    const { setAuthData } = useAuth();
    const { handlePostLogin } = useAuthNavigation();
    const t = useTranslations('VerifyEmailPage');
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams?.get('email');
    const verificationCode = searchParams?.get('verificationCode');

    const handleSuccessfulLogin = (user: User) => {
        setAuthData(user);
        handlePostLogin(user);
    };

    const fetch = usePost<IVerifyEmailBody, User>(authService.verifyEmail, 'POST', {
        onError: (data: any) => {
            toastHelper.showErrorMessage(data);
            router.push('/auth/login');
        },
        onSuccess: (data: User) => {
            toastHelper.showSuccessMessage(t('verifySuccessMessage'));
            handleSuccessfulLogin(data);
            router.push('/home');
        },
    });

    useEffect(() => {
        if (!email || !verificationCode) {
            toastHelper.showErrorMessage('invalidUrlErrorMessage');
            router.push('/auth/login');
            return;
        }
        const fetchData = async () => {
            await fetch.execute({ email, verificationCode });
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-muted px-4">
            <div className="w-full max-w-md">
                <Card className="rounded-2xl shadow-md">
                    <CardContent className="p-6 space-y-6">
                        {fetch.loading ? (
                            <Spinner />
                        ) : fetch.error ? (
                            <div className="text-center">
                                <h1 className="text-2xl font-semibold">{t('errorTitle')}</h1>
                                {/* <p className="text-muted-foreground text-sm">{t('errorSubtitle')}</p> */}
                            </div>
                        ) : (
                            <div className="text-center">
                                <h1 className="text-2xl font-semibold">{t('title')}</h1>
                                <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
