'use client';

import { useRef } from 'react';
import ErrorBoundary from '@/core/ErrorBoundary';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/stores/store';
import { ThemeProvider } from '@/lib/providers/theme';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { RouteGuard } from '@/components/guards/RouteGuard';
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';
import { ReactFlowProvider } from '@xyflow/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(store);
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReduxProvider store={storeRef.current}>
          <ErrorBoundary>
            <ReduxProvider store={store}>
              <ThemeProvider>
                <ReactFlowProvider>
                  <AuthProvider>{children}</AuthProvider>
                </ReactFlowProvider>
              </ThemeProvider>
            </ReduxProvider>
            <Toaster />
          </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  );
}
