'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { useCallback } from 'react';
import {
  getPostLoginRedirect,
  getPostRegistrationRedirect,
  RedirectService,
} from '@/utils/auth/redirectService';
import { ROUTES } from '@/utils/constants/routes';

/**
 * Custom hook for handling authentication-related navigation
 * Provides locale-aware navigation and authentication flow management
 */
export function useAuthNavigation() {
  const { isAuthenticated, userType, markOnboardingComplete } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  // ==================== LOCALE UTILITIES ====================

  /**
   * Extracts the current locale from the pathname using routing configuration
   * Falls back to default locale if not found
   * @returns Current locale string (e.g., 'en', 'vi')
   */
  const getCurrentLocale = useCallback(() => {
    try {
      // Use routing.locales to validate and extract locale
      const segments = pathname?.split('/') || [];
      const potentialLocale = segments[1];

      if (potentialLocale && routing.locales.includes(potentialLocale as any)) {
        return potentialLocale;
      }

      return routing.defaultLocale;
    } catch (error) {
      return routing.defaultLocale;
    }
  }, [pathname]);

  /**
   * Navigates to a path without any locale handling
   * Uses the exact path provided without modification
   * @param path - The exact path to navigate to
   */
  const navigate = useCallback(
    (path: string) => {
      try {
        router.push(path);
      } catch (error) {
        console.error('Direct navigation error:', error);
      }
    },
    [router],
  );

  // ==================== AUTHENTICATION FLOW HANDLERS ====================

  /**
   * Handles navigation after successful login
   * Determines the appropriate redirect path based on user properties
   * @param user - The authenticated user object
   */
  const handlePostLogin = useCallback(
    (user: any) => {
      try {
        const redirectPath = getPostLoginRedirect(user);
        navigate(redirectPath);
      } catch (error) {
        console.error('Post-login navigation error:', error);
        // Fallback to home page
        navigateToHome();
      }
    },
    [navigate],
  );

  /**
   * Handles navigation after successful registration
   * Directs new users to appropriate onboarding or welcome flow
   * @param user - The newly registered user object
   */
  const handlePostRegistration = useCallback(
    (user: any) => {
      try {
        const redirectPath = getPostRegistrationRedirect(user);
        navigate(redirectPath);
      } catch (error) {
        console.error('Post-registration navigation error:', error);
        // Fallback to welcome page
        navigateToWelcome();
      }
    },
    [navigate],
  );

  /**
   * Handles completion of the onboarding process
   * Marks onboarding as complete and redirects to home
   */
  const handleOnboardingComplete = useCallback(() => {
    try {
      markOnboardingComplete();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Onboarding completion error:', error);
    }
  }, [markOnboardingComplete, navigate]);

  // ==================== NAVIGATION HELPERS ====================

  /**
   * Navigates to the appropriate home page based on user type
   * Uses RedirectService to determine the correct home route
   */
  const navigateToHome = useCallback(() => {
    try {
      const homePath = RedirectService.getHomeRedirect(userType);
      navigate(homePath);
    } catch (error) {
      console.error('Home navigation error:', error);
      // Fallback to default home
      navigate(ROUTES.HOME);
    }
  }, [userType, navigate]);

  /**
   * Navigates to the login page with optional redirect parameter
   * Preserves the current page as redirect destination if specified
   * @param redirectTo - Optional path to redirect to after login
   */
  const navigateToLogin = useCallback(
    (redirectTo?: string) => {
      try {
        const loginPath = redirectTo
          ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectTo)}`
          : ROUTES.LOGIN;
        navigate(loginPath);
      } catch (error) {
        console.error('Login navigation error:', error);
        navigate(ROUTES.LOGIN);
      }
    },
    [navigate],
  );

  /**
   * Navigates to the welcome/introduction page
   * Typically used for new users or public landing
   */
  const navigateToWelcome = useCallback(() => {
    navigate(ROUTES.WELCOME);
  }, [navigate]);

  /**
   * Navigates to the onboarding flow
   * Used for new users who need to complete setup
   */
  const navigateToOnboarding = useCallback(() => {
    navigate(ROUTES.ONBOARDING);
  }, [navigate]);

  // ==================== ROUTE ACCESS CONTROL ====================

  /**
   * Checks if the current user can access a specific route
   * Handles locale prefixes and validates against user permissions
   * @param path - The path to check access for
   * @returns Boolean indicating if access is allowed
   */
  const canAccessRoute = useCallback(
    (path: string) => {
      try {
        // Normalize path by removing locale prefix if present
        const pathWithoutLocale = removeLocalePrefix(path);

        const { shouldRedirect } = RedirectService.shouldRedirect(
          pathWithoutLocale,
          userType,
          isAuthenticated,
        );

        return !shouldRedirect;
      } catch (error) {
        console.error('Route access check error:', error);
        // Err on the side of caution - deny access on error
        return false;
      }
    },
    [userType, isAuthenticated],
  );

  /**
   * Gets the redirect destination for unauthorized route access
   * Determines where to send users who can't access a specific route
   * @param path - The path that was attempted to be accessed
   * @returns The path to redirect to, or null if access is allowed
   */
  const getRedirectForRoute = useCallback(
    (path: string) => {
      try {
        const pathWithoutLocale = removeLocalePrefix(path);

        const { destination } = RedirectService.shouldRedirect(
          pathWithoutLocale,
          userType,
          isAuthenticated,
        );

        return destination;
      } catch (error) {
        console.error('Redirect determination error:', error);
        // Fallback to login for unauthorized access
        return ROUTES.LOGIN;
      }
    },
    [userType, isAuthenticated],
  );

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Removes locale prefix from a path if present
   * Handles both supported locales dynamically
   * @param path - The path to normalize
   * @returns Path without locale prefix
   */
  const removeLocalePrefix = useCallback(
    (path: string) => {
      const segments = path.split('/');
      if (segments.length > 1 && routing.locales.includes(segments[1] as any)) {
        return '/' + segments.slice(2).join('/');
      }
      return path;
    },
    [routing.locales],
  );

  // ==================== RETURN INTERFACE ====================

  return {
    // Core navigation methods
    navigate,

    navigateToHome,
    navigateToLogin,
    navigateToWelcome,
    navigateToOnboarding,

    // Authentication flow handlers
    handlePostLogin,
    handlePostRegistration,
    handleOnboardingComplete,

    // Route access control
    canAccessRoute,
    getRedirectForRoute,

    // Current state and utilities
    userType,
    isAuthenticated,
    getCurrentLocale,
  };
}
