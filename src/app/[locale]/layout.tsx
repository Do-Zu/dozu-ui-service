import React from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages } from '@/i18n/messages';
import Providers from '../Providers';
import DefaultLayout from '@/layouts/DefaultLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './home/components/side-bar/SideBar';

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
      <SidebarProvider>
        <AppSidebar />
        <DefaultLayout>{children}</DefaultLayout>
      </SidebarProvider>
    </Providers>
  );
}
