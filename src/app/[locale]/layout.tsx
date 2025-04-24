import React from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import Providers from '../Providers';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/core/ErrorBoundary';
import '../../styles/globals.css';

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

  // Load & merge tất cả file JSON trong folder messages/[locale]/
  const messages = {
    ...(await import(`../../../messages/${locale}/common.json`)).default,
    ...(await import(`../../../messages/${locale}/home.json`)).default,
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground transition-colors">
        <ErrorBoundary>
          <Providers locale={locale} messages={messages}>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
