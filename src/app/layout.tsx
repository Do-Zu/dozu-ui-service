'use client'

import ErrorBoundary from '@/core/ErrorBoundary';
import DefaultLayout from '@/layouts/DefaultLayout';
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';
import { store } from '@/stores/store';
import { useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(store);
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReduxProvider store={storeRef.current}>
        <ErrorBoundary>
          <DefaultLayout>{children}</DefaultLayout>
          <Toaster />
        </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  );
}
