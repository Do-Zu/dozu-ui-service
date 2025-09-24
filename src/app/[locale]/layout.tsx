import React from 'react';
import { LocaleFontProvider } from '@/components/ui/LocaleFontProvider';
import Providers from '../Providers';
import DefaultLayout from '@/layouts/DefaultLayout';
import { getMessages } from '@/i18n/messages';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const messages = await getMessages(locale);
    return (
        <Providers locale={locale} messages={messages}>
            <LocaleFontProvider>
                <DefaultLayout>{children}</DefaultLayout>
            </LocaleFontProvider>
        </Providers>
    );
}
