'use client';

import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import {
  getPostLoginRedirect,
  getPostRegistrationRedirect,
  RedirectService,
} from '@/utils/auth/redirectService';
import { ROUTES } from '@/utils/constants/routes';

export function useAuthNavigation() {
  const { isAuthenticated, userType, markOnboardingComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get current locale from pathname
  const getCurrentLocale = useCallback(() => {
    return pathname?.split('/')[1] || 'en';
  }, [pathname]);

  // Navigate with locale preservation
  const navigateWithLocale = useCallback(
    (path: string) => {
      const locale = getCurrentLocale();
      router.push(`/${locale}${path}`);
    },
    [getCurrentLocale, router],
  );

  // Handle post-login redirect
  const handlePostLogin = useCallback(
    (user: any) => {
      const redirectPath = getPostLoginRedirect(user);
      navigateWithLocale(redirectPath);
    },
    [navigateWithLocale],
  );

  // Handle post-registration redirect
  const handlePostRegistration = useCallback(
    (user: any) => {
      const redirectPath = getPostRegistrationRedirect(user);
      navigateWithLocale(redirectPath);
    },
    [navigateWithLocale],
  );

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    markOnboardingComplete();
    navigateWithLocale(ROUTES.HOME);
  }, [markOnboardingComplete, navigateWithLocale]);

  // Navigate to appropriate home based on user type
  const navigateToHome = useCallback(() => {
    const homePath = RedirectService.getHomeRedirect(userType);
    navigateWithLocale(homePath);
  }, [userType, navigateWithLocale]);

  // Navigate to login with optional redirect
  const navigateToLogin = useCallback(
    (redirectTo?: string) => {
      const loginPath = redirectTo
        ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectTo)}`
        : ROUTES.LOGIN;
      navigateWithLocale(loginPath);
    },
    [navigateWithLocale],
  );

  // Navigate to welcome page
  const navigateToWelcome = useCallback(() => {
    navigateWithLocale(ROUTES.WELCOME);
  }, [navigateWithLocale]);

  // Navigate to onboarding
  const navigateToOnboarding = useCallback(() => {
    navigateWithLocale(ROUTES.ONBOARDING);
  }, [navigateWithLocale]);

  // Check if user can access a specific route
  const canAccessRoute = useCallback(
    (path: string) => {
      // Remove locale from path if present
      const pathWithoutLocale =
        path.startsWith('/en/') || path.startsWith('/vi/') ? path.substring(3) : path;

      const { shouldRedirect } = RedirectService.shouldRedirect(
        pathWithoutLocale,
        userType,
        isAuthenticated,
      );

      return !shouldRedirect;
    },
    [userType, isAuthenticated],
  );

  // Get redirect destination for unauthorized access
  const getRedirectForRoute = useCallback(
    (path: string) => {
      const pathWithoutLocale =
        path.startsWith('/en/') || path.startsWith('/vi/') ? path.substring(3) : path;

      const { destination } = RedirectService.shouldRedirect(
        pathWithoutLocale,
        userType,
        isAuthenticated,
      );

      return destination;
    },
    [userType, isAuthenticated],
  );

  return {
    // Navigation methods
    navigateWithLocale,
    navigateToHome,
    navigateToLogin,
    navigateToWelcome,
    navigateToOnboarding,

    // Event handlers
    handlePostLogin,
    handlePostRegistration,
    handleOnboardingComplete,

    // Route access checking
    canAccessRoute,
    getRedirectForRoute,

    // Current state
    userType,
    isAuthenticated,
    getCurrentLocale,
  };
}
