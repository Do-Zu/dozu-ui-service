import { ROUTES, ROUTE_CONFIG, ROUTE_ACCESS } from '@/utils/constants/routes';
import { User, UserType, RedirectConfig } from '@/types/auth';

/**
 * Determines the user type based on authentication status and onboarding completion
 */
export function getUserType(isAuthenticated: boolean, user: User | null): UserType {
  if (!isAuthenticated || !user) {
    return 'guest';
  }

  // Check if user is new (registered today or never logged in)
  const isNewUser =
    user.isNewUser ||
    (!user.lastLoginAt &&
      user.createdAt &&
      new Date(user.createdAt).toDateString() === new Date().toDateString());

  if (isNewUser) {
    return 'new_user';
  }

  if (!user.hasCompletedOnboarding) {
    return 'returning_user';
  }

  return 'onboarded_user';
}

/**
 * Default redirect destinations for each user type
 */
export const DEFAULT_REDIRECTS: RedirectConfig = {
  guest: ROUTES.WELCOME,
  new_user: ROUTES.WELCOME,
  returning_user: ROUTES.ONBOARDING,
  onboarded_user: ROUTES.HOME,
};

/**
 * Determines if a user can access a specific route
 */
export function canAccessRoute(
  pathname: string,
  userType: UserType,
  isAuthenticated: boolean,
): boolean {
  const routeAccess = ROUTE_CONFIG[pathname as keyof typeof ROUTE_CONFIG];

  if (!routeAccess) {
    // If route is not configured, allow access (for dynamic routes)
    return true;
  }

  switch (routeAccess) {
    case ROUTE_ACCESS.PUBLIC:
      return true;

    case ROUTE_ACCESS.GUEST_ONLY:
      return !isAuthenticated;

    case ROUTE_ACCESS.AUTHENTICATED:
      return isAuthenticated;

    case ROUTE_ACCESS.NEW_USER:
      return userType === ROUTE_ACCESS.NEW_USER;

    case ROUTE_ACCESS.ONBOARDED:
      return userType === 'onboarded_user';

    default:
      return false;
  }
}

/**
 * Gets the appropriate redirect destination for a user trying to access an unauthorized route
 */
export function getRedirectDestination(
  pathname: string,
  userType: UserType,
  isAuthenticated: boolean,
): string | null {
  if (canAccessRoute(pathname, userType, isAuthenticated)) {
    return null; // No redirect needed
  }

  // Handle specific redirect cases
  switch (userType) {
    case 'guest':
      // Guests trying to access protected routes go to welcome
      if (pathname.startsWith('/auth/')) {
        return null; // Let them access auth routes
      }
      return ROUTES.WELCOME;

    case 'new_user':
      // New users should go to welcome, but can't access onboarding without completing welcome
      if (pathname === ROUTES.ONBOARDING || pathname === ROUTES.HOME) {
        return ROUTES.WELCOME;
      }
      if (pathname.startsWith('/auth/')) {
        return ROUTES.WELCOME; // Redirect logged-in users away from auth
      }
      break;

    case 'returning_user':
      // Returning users without onboarding should complete onboarding
      if (pathname === ROUTES.WELCOME) {
        return ROUTES.HOME; // Prevent access to welcome
      }
      if (pathname.startsWith('/auth/')) {
        return ROUTES.HOME; // Redirect logged-in users away from auth
      }
      // For other protected routes, they need to complete onboarding first
      if (ROUTE_CONFIG[pathname as keyof typeof ROUTE_CONFIG] === ROUTE_ACCESS.ONBOARDED) {
        return ROUTES.ONBOARDING;
      }
      break;

    case 'onboarded_user':
      // Onboarded users can't access welcome or onboarding
      if (pathname === ROUTES.WELCOME || pathname === ROUTES.ONBOARDING) {
        return ROUTES.HOME;
      }
      if (pathname.startsWith('/auth/')) {
        return ROUTES.HOME; // Redirect logged-in users away from auth
      }
      break;
  }

  return DEFAULT_REDIRECTS[userType];
}

/**
 * Handles post-login redirect logic
 */
export function getPostLoginRedirect(user: User): string {
  const userType = getUserType(true, user);

  switch (userType) {
    case 'new_user':
      return ROUTES.WELCOME;
    case 'returning_user':
      return ROUTES.ONBOARDING;
    case 'onboarded_user':
      return ROUTES.HOME;
    default:
      return ROUTES.HOME;
  }
}

/**
 * Handles post-registration redirect logic
 */
export function getPostRegistrationRedirect(user: User): string {
  // New registered users always go to welcome
  return ROUTES.WELCOME;
}

/**
 * Checks if a route requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const routeAccess = ROUTE_CONFIG[pathname as keyof typeof ROUTE_CONFIG];
  return routeAccess === ROUTE_ACCESS.AUTHENTICATED || routeAccess === ROUTE_ACCESS.ONBOARDED;
}

/**
 * Checks if a route is auth-only (login/register)
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth/');
}

/**
 * Navigation utility with redirect logic
 */
export class RedirectService {
  static shouldRedirect(
    pathname: string,
    userType: UserType,
    isAuthenticated: boolean,
  ): { shouldRedirect: boolean; destination?: string } {
    const destination = getRedirectDestination(pathname, userType, isAuthenticated);

    return {
      shouldRedirect: destination !== null,
      destination: destination || undefined,
    };
  }

  static getHomeRedirect(userType: UserType): string {
    return DEFAULT_REDIRECTS[userType];
  }

  static getProtectedRouteRedirect(userType: UserType): string {
    if (userType === 'guest') {
      return ROUTES.LOGIN;
    }
    return DEFAULT_REDIRECTS[userType];
  }
}
