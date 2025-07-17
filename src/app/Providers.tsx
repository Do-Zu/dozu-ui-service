'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/stores/store';
import { ThemeProvider } from '@/lib/providers/theme';
import { NextIntlClientProvider } from 'next-intl';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode, setLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { useDispatch } from 'react-redux';
import { useRoleChecker } from '@/hooks/useRoleChecker';

interface ProvidersProps {
    children: ReactNode;
    locale: string;
    messages: Record<string, any>;
}

export default function Providers({ children, locale, messages }: ProvidersProps) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Ho_Chi_Minh">
            {children}
        </NextIntlClientProvider>
    );
}
