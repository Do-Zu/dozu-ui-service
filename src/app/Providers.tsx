'use client';

import { ReactNode, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/stores/store';
import { ThemeProvider } from '@/lib/providers/theme';
import { NextIntlClientProvider } from 'next-intl';
import ThemeToggle from '@/components/toolbar/ThemeToggle';
import LanguageSwitcher from '@/components/toolbar/LanguageSwitcher';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, any>;
}

export default function Providers({ children, locale, messages }: ProvidersProps) {
  const storeRef = useRef(store);

  return (
    <ReduxProvider store={storeRef.current}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider>
          <ThemeToggle />
          <LanguageSwitcher />
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </ReduxProvider>
  );
}
