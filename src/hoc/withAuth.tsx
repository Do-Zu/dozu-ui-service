import LoadingPage from '@/app/loading';
import { useAuth } from '@/contexts/auth/AuthContext';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useCallback } from 'react';

interface WithAuthOptions {
  requiredRole?: string;
  requiredPermission?: string;
  redirectTo?: string;
}

const DEFAULT_REDIRECT = ROUTES.LOGIN;
const DEFAULT_UNAUTHORIZED = ROUTES.HOME;
const DEFAULT_REDIRECT_BACK = ROUTES.LANDING;

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {},
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasRole, hasPermission, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const { requiredRole, requiredPermission, redirectTo = DEFAULT_REDIRECT } = options;

    if (isLoading) {
      return <LoadingPage />;
    }

    const hasAccess = useMemo(() => {
      if (!isAuthenticated) return false;
      if (requiredRole && !hasRole(requiredRole)) return false;
      if (requiredPermission && !hasPermission(requiredPermission)) return false;
      return true;
    }, [isAuthenticated, hasRole, hasPermission, requiredRole, requiredPermission]);

    const handleRedirect = useCallback(() => {
      if (isLoading) return;

      if (!isAuthenticated) {
        const redirectPath = redirectTo ?? DEFAULT_REDIRECT;

        // Encode the current pathname to redirect back after login
        const redirectBackPath = encodeURIComponent(pathname ?? DEFAULT_REDIRECT_BACK);

        router.push(`${redirectPath}?redirect=${redirectBackPath}`);

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

    if (!hasAccess) {
      return null;
    }

    return <Component {...props} />;
  };
}
