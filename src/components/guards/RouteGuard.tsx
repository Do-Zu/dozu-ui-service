'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, Suspense, useState, useMemo } from 'react';
import { RedirectService } from '@/utils/auth/redirectService';
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
    const { isLoading, isAuthenticated, userType } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const { locale, pathWithoutLocale } = useMemo(() => {
        const path = pathname ?? '/';
        const parts = path.split('/').filter(Boolean);
        const locale = parts[0] ?? null;
        const pathWithoutLocale = '/' + parts?.slice(1)?.join('/');
        return {
            locale,
            pathWithoutLocale,
        };
    }, [pathname]);

    const decision = useMemo(() => {
        return RedirectService.shouldRedirect(pathWithoutLocale, userType, isAuthenticated);
    }, [pathWithoutLocale, userType, isAuthenticated]);

    useEffect(() => {
        // if (!isHydrated || isLoading || pathname == null) return;
        // const { shouldRedirect, destination } = decision;
        // if (!shouldRedirect || !destination) return;
        // const localizedDestination = locale ? `/${locale}${destination}` : destination;
        // if (localizedDestination === pathname) return;
        // router.replace(destination);
    }, [decision, isHydrated, isLoading, pathname, locale, router]);

    if (!isHydrated || isLoading || decision.shouldRedirect) {
        return fallback || <LoadingPage />;
    }

    // if (decision.shouldRedirect) {
    //     router.push(ROUTES.LANDING);
    //     return null;
    // }

    return <Suspense fallback={fallback || <LoadingPage />}>{children}</Suspense>;
}

/**
 * HOC version of RouteGuard for wrapping components
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function withRouteGuard<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode) {
    return function GuardedComponent(props: P) {
        return (
            <RouteGuard fallback={fallback}>
                <Component {...props} />
            </RouteGuard>
        );
    };
}
