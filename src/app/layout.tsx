'use client';

import { useRef } from 'react';
import localFont from 'next/font/local';
import { Provider as ReduxProvider } from 'react-redux';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ThemeProvider } from '@/lib/providers/theme';
import { store } from '@/stores/store';
import { ReactFlowProvider } from '@xyflow/react';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/core/ErrorBoundary';
import UpgradePlanModal from '@/components/upgrade-plan/UpgradePlanModal';
import '../styles/globals.css';

const geist = localFont({
    src: [
        {
            path: '../fonts/static/Geist-Regular.ttf',
            weight: '100 900',
            style: 'normal',
        },
    ],
    variable: '--font-sans',
    display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const storeRef = useRef(store);
    return (
        <html lang="en" suppressHydrationWarning className={geist.variable}>
            <body className="font-sans">
                <ReduxProvider store={storeRef.current}>
                    <ErrorBoundary>
                        <ReduxProvider store={store}>
                            <ThemeProvider>
                                <ReactFlowProvider>
                                    <AuthProvider>
                                        {children}
                                        <UpgradePlanModal />
                                    </AuthProvider>
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
