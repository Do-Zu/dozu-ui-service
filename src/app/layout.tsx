'use client';

import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import StoreProvider from './StoreProvider';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ThemeProvider } from '@/lib/providers/theme';
import { ReactFlowProvider } from '@xyflow/react';
import { Toaster } from '@/components/ui/toaster';
import UpgradePlanModal from '@/components/upgrade-plan/UpgradePlanModal';
import '../styles/globals.css';

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-primary',
    display: 'swap',
});

const geist = localFont({
    src: [
        {
            path: '../fonts/static/Geist-Thin.ttf',
            weight: '100',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-ExtraLight.ttf',
            weight: '200',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-ExtraBold.ttf',
            weight: '800',
            style: 'normal',
        },
        {
            path: '../fonts/static/Geist-Black.ttf',
            weight: '900',
            style: 'normal',
        },
    ],
    variable: '--font-geist',
    display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${inter.variable} ${geist.variable} scrollbar-thin scrollbar-hide`}
        >
            <body className="font-sans">
                <StoreProvider>
                    <ThemeProvider>
                        <ReactFlowProvider>
                            <AuthProvider>
                                {children}
                                <UpgradePlanModal />
                            </AuthProvider>
                        </ReactFlowProvider>
                    </ThemeProvider>
                    <Toaster />
                </StoreProvider>
            </body>
        </html>
    );
}
