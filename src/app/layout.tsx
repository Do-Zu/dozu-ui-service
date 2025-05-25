'use client';

import ErrorBoundary from '@/core/ErrorBoundary';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/stores/store';
import { ThemeProvider } from '@/lib/providers/theme';
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <ReduxProvider store={store}>
            <ThemeProvider>{children}</ThemeProvider>
          </ReduxProvider>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
