'use client';

import { useLocale } from 'next-intl';
import { ReactNode } from 'react';
import { getFontClass } from '@/fonts/font-config';

interface LocaleFontProviderProps {
    children: ReactNode;
    className?: string;
}

export function LocaleFontProvider({ children, className = '' }: LocaleFontProviderProps) {
    const locale = useLocale();
    const fontClass = getFontClass(locale);

    return <div className={`${fontClass} ${className}`}>{children}</div>;
}

export function useLocaleFont() {
    const locale = useLocale();
    return getFontClass(locale);
}
