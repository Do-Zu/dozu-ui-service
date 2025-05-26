import LoadingPage from '@/app/loading';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback } from 'react';

interface WithAuthOptions {
  requiredRole?: string;
  requiredPermission?: string;
  redirectTo?: string;
}

const DEFAULT_REDIRECT = '/login';
const DEFAULT_UNAUTHORIZED = '/unauthorized';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {},
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasRole, hasPermission, isLoading } = useAuth();
    const router = useRouter();

    const { requiredRole, requiredPermission, redirectTo = DEFAULT_REDIRECT } = options;

    const hasAccess = useMemo(() => {
      if (!isAuthenticated) return false;
      if (requiredRole && !hasRole(requiredRole)) return false;
      if (requiredPermission && !hasPermission(requiredPermission)) return false;
      return true;
    }, [isAuthenticated, hasRole, hasPermission, requiredRole, requiredPermission]);

    const handleRedirect = useCallback(() => {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (
        (requiredRole && !hasRole(requiredRole)) ||
        (requiredPermission && !hasPermission(requiredPermission))
      ) {
        router.push(DEFAULT_UNAUTHORIZED);
        return;
      }
    }, [
      isAuthenticated,
      isLoading,
      hasRole,
      hasPermission,
      requiredRole,
      requiredPermission,
      router,
      redirectTo,
    ]);

    useEffect(() => {
      handleRedirect();
    }, [handleRedirect]);

    if (isLoading) {
      return <LoadingPage />;
    }

    if (!hasAccess) {
      return null;
    }

    return <Component {...props} />;
  };
}
