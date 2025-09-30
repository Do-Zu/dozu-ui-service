'use client';

import CentralCard from '@/components/auth/CentralCard';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';

const page = () => {
    const t = useTranslations('ChangePasswordEmailSentPage');

    const router = useRouter();

    const onLoginClick = () => {
        router.push(`/auth/login`);
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
                            <div className="flex justify-end">
                                <Button className="text-sm text-muted-foreground" variant="link" onClick={onLoginClick}>
                                    {t('loginLink')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </CentralCard>
    );
};

export default page;
