// Permission-based Component Rendering
import { useAuth } from '@/contexts/auth/AuthContext';
import { ReactNode, useMemo } from 'react';

interface PermissionGateProps {
  children: ReactNode;
  role?: string;
  permission?: string;
  fallback?: ReactNode;
  requireAll?: boolean; // If both role and permission are provided
  requireAuth?: boolean; // Require authentication
}

export function PermissionGate({
  children,
  role,
  permission,
  fallback = null,
  requireAll = false,
  requireAuth = true,
}: PermissionGateProps) {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();

  const hasAccess = useMemo(() => {
    // Check authentication first if required
    if (requireAuth && !isAuthenticated) return false;

    // If no role or permission specified, allow access (assuming auth check passed)
    if (!role && !permission) return true;

    const roleCheck = role ? hasRole(role) : true;
    const permissionCheck = permission ? hasPermission(permission) : true;

    // Handle logic based on requireAll flag
    if (role && permission) {
      return requireAll ? roleCheck && permissionCheck : roleCheck || permissionCheck;
    }

    return roleCheck && permissionCheck;
  }, [isAuthenticated, hasRole, hasPermission, role, permission, requireAll, requireAuth]);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
