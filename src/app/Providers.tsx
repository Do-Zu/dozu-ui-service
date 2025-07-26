'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';

interface ProvidersProps {
    children: ReactNode;
    locale: string;
    messages: Record<string, any>;
}

export default function Providers({ children, locale, messages }: ProvidersProps) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Ho_Chi_Minh">
            <UserTrackingProvider
                autoStartTracking={true}
                enableAutoSend={true}
                minSessionTime={5000} // 5 seconds minimum session
                apiEndpoint="/tracking/active-learning"
            >
                {children}
            </UserTrackingProvider>
        </NextIntlClientProvider>
    );
}
