'use client';

import CentralCard from '@/components/auth/CentralCard';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import usePost from '@/hooks/usePost';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import toastHelper from '@/utils/toast.helper';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, SendHorizontal } from 'lucide-react';

interface IChangePasswordInfoRequestBody {
    email: string;
    verificationCode: string;
    password: string;
}

const page = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const verificationCode = searchParams.get('verificationCode') || '';
    if (!email || !verificationCode) {
        toastHelper.showErrorMessage('Invalid change password URL.');
        router.push(`/auth/login`);
    }

    const { setAuthData } = useAuth();

    const t = useTranslations('ChangePasswordPage');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };
    const onChangeRepeatPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatPassword(e.target.value);
    };

    const {
        loading: isLoading,
        data: apiResponse,
        error: apiPostContentError,
        execute: sendChangePasswordRequest,
    } = usePost<IChangePasswordInfoRequestBody, any>('/auth/change-password', 'POST', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            setAuthData(data.data);
            router.push(`/home`);
        },
    });

    const onSubmit = async () => {
        if (password !== repeatPassword) {
            toastHelper.showErrorMessage(t('repeatPasswordNotMatchingError'));
        } else {
            const result = await sendChangePasswordRequest({
                email: email,
                verificationCode: verificationCode,
                password: password,
            });
        }
    };

    return (
        <CentralCard>
            <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold">{t('title')}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">{t('subtitle')}</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                <div className="space-y-5">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-sm font-medium">
                                {t('passwordLabel')}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="h-12 text-base"
                                value={password}
                                onChange={onChangePassword}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="repeatPassword" className="text-sm font-medium">
                                {t('repeatPasswordLabel')}
                            </Label>
                            <Input
                                id="repeatPassword"
                                type="password"
                                required
                                className="h-12 text-base"
                                value={repeatPassword}
                                onChange={onChangeRepeatPassword}
                            />
                        </div>
                    </div>
                    <Button
                        disabled={isLoading}
                        className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
                        onClick={onSubmit}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <SendHorizontal className="h-5 w-5" />
                        )}
                        {t('submitButtonText')}
                    </Button>
                </div>
            </CardContent>
        </CentralCard>
    );
};

export default page;
