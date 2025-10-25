'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, Suspense, useState } from 'react';
import { RedirectService } from '@/utils/auth/redirectService';
import { RedirectChainService } from '@/utils/auth/redirectChainService';
import LoadingPage from '@/app/loading';

interface RouteGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Client-side route guard that ensures users are redirected to appropriate pages
 * based on their authentication status and onboarding completion
 */
export function RouteGuard({ children, fallback }: RouteGuardProps) {
    const { isLoading, isAuthenticated, userType, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false);

    // Ensure hydration is complete before making routing decisions
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated || isLoading) return;

        if (pathname == null) {
            console.error('RouteGuard: pathname is null or undefined');
            return;
        }

        // Extract the path without locale
        // const pathSegments = pathname.split('/');
        // const locale = pathSegments[1];
        // const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

        // const { shouldRedirect, destination } = RedirectService.shouldRedirect(
        //     pathWithoutLocale,
        //     userType,
        //     isAuthenticated,
        // );

        // if (shouldRedirect && destination) {
        //     router.replace(destination);
        // }
    }, [isAuthenticated, userType, user]);

    // Show loading during hydration
    if (!isHydrated || isLoading) {
        return fallback || <LoadingPage />;
    }

    // Check if current route is accessible
    const pathSegments = pathname?.split('/');
    const locale = pathSegments?.[1];
    const pathWithoutLocale = pathname?.replace(`/${locale}`, '') || '/';

    const { shouldRedirect } = RedirectService.shouldRedirect(pathWithoutLocale, userType, isAuthenticated);

    if (shouldRedirect) {
        return fallback || <LoadingPage />;
    }

    return <Suspense fallback={fallback || <LoadingPage />}>{children}</Suspense>;
}

/**
 * HOC version of RouteGuard for wrapping components
 */
export function withRouteGuard<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode) {
    return function GuardedComponent(props: P) {
        return (
            <RouteGuard fallback={fallback}>
                <Component {...props} />
            </RouteGuard>
        );
    };
}
