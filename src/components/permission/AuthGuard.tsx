/**
 * Component-Level Protection
 * Guard entire component trees
 * This component checks if the user is authenticated and has the required role or permission.
 */
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useCallback } from 'react';
import Spinner from '../ui/spinner';

interface AuthGuardProps {
    children: ReactNode;
    fallbackAuth?: ReactNode;
    fallbackPermission?: ReactNode;
    loadingComponent?: ReactNode;
    requiredRole?: string;
    requiredPermission?: string;
    redirectTo?: string;
    requireAll?: boolean; // If both role and permission are provided
}

export function AuthGuard({
    children,
    fallbackAuth = null,
    fallbackPermission = null,
    loadingComponent = <Spinner />,
    requiredRole,
    requiredPermission,
    redirectTo,
    requireAll = false,
}: AuthGuardProps) {
    const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
    const router = useRouter();

    const hasAccess = useMemo(() => {
        if (!isAuthenticated) return false;

        const roleCheck = requiredRole ? hasRole(requiredRole) : true;
        const permissionCheck = requiredPermission ? hasPermission(requiredPermission) : true;

        return requireAll ? roleCheck && permissionCheck : roleCheck || permissionCheck;
    }, [isAuthenticated, hasRole, hasPermission, requiredRole, requiredPermission, requireAll]);

    const handleRedirect = useCallback(() => {
        if (isLoading) return;
        if (!isAuthenticated && redirectTo) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, redirectTo, router]);

    useEffect(() => {
        handleRedirect();
    }, [handleRedirect]);

    if (isLoading) {
        return <>{loadingComponent}</>;
    }

    if (!isAuthenticated) {
        return redirectTo ? null : fallbackAuth;
    }

    if (!hasAccess) {
        return <>{fallbackPermission}</>;
    }

    return <>{children}</>;
}
