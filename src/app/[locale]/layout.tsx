import React from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages } from '@/i18n/messages';
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

  // Load messages from the centralized message loader
  const messages = await getMessages(locale);

  return (
    <Providers locale={locale} messages={messages}>
      {children}
    </Providers>
  );
}
