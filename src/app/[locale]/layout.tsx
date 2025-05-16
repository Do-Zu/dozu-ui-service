

import React from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import Providers from '../Providers';

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
    ...(await import(`../../../messages/${locale}/login.json`)).default,
    ...(await import(`../../../messages/${locale}/registerPage.json`)).default,
    ...(await import(`../../../messages/${locale}/verifyEmailPage.json`)).default,

  };

  return (
    <ErrorBoundary>
      <Providers locale={locale} messages={messages}>
        <Navbar />
        {children}
        <Toaster />
      </Providers>
    </ErrorBoundary>
  );
}
