'use client';

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/app/[locale]/generate/stores/store'; 

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
