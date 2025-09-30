'use client';

import CentralCard from '@/components/auth/CentralCard';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import usePost from '@/hooks/usePost';
import { Loader2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import toastHelper from '@/utils/toast.helper';
import React, { useState } from 'react';

interface IChangePasswordRequestBody {
    email: string;
}

const page = () => {
    const t = useTranslations('ForgotPasswordPage');
    const [email, setEmail] = useState('');
    const router = useRouter();

    const onLoginClick = () => {
        router.push(`/auth/login`);
    };

    const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const {
        loading: isLoading,
        data: apiResponse,
        error: apiPostContentError,
        execute: sendChangePasswordRequest,
    } = usePost<IChangePasswordRequestBody, any>('/auth/send-change-password-link', 'POST', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess() {
            router.push(`/auth/changePasswordEmailSent`);
        },
    });

    const onSubmit = async () => {
        await sendChangePasswordRequest({ email: email });
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
                            <Label htmlFor="email" className="text-sm font-medium">
                                {t('email')}
                            </Label>
                            <Input
                                id="email"
                                placeholder="email@gmail.com"
                                required
                                className="h-12 text-base"
                                value={email}
                                onChange={onChangeEmail}
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-end">
                                <Button className="text-sm text-muted-foreground" variant="link" onClick={onLoginClick}>
                                    {t('loginLink')}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button
                        disabled={isLoading}
                        className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
                        onClick={onSubmit}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                        {t('sendEmail')}
                    </Button>
                </div>
            </CardContent>
        </CentralCard>
    );
};

export default page;
