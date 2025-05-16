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

  const messages = {
    ...(await import(`../../../messages/${locale}/common.json`)).default,
    ...(await import(`../../../messages/${locale}/home.json`)).default,
  };

  return (
    <Providers locale={locale} messages={messages}>
      {children}
    </Providers>
  );
}
