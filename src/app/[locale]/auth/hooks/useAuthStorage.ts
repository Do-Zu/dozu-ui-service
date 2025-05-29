import { useLocalStorage } from '@/hooks/useLocalStorage';
import { User } from '@/types/auth';
import { getISOTime } from '@/utils';
import { useCallback } from 'react';

/**
 * Hook for managing authentication data in localStorage
 */
export function useAuthStorage() {
  const [user, setUserData, removeUser] = useLocalStorage<User | null>('user', null);

  const [isLoggedIn, setIsLoggedIn, removeLoginStatus] = useLocalStorage<boolean>(
    'isLoggedIn',
    false,
  );

  const setAuthData = useCallback(
    (userData: User) => {
      const userWithTimestamp = {
        ...userData,
        lastLoginAt: getISOTime(),
      };
      setUserData(userWithTimestamp);
      setIsLoggedIn(true);
    },
    [setUserData, setIsLoggedIn],
  );

  const updateUser = useCallback(
    (updatedUser: Partial<User>) => {
      setUserData((prevUser) => (prevUser ? { ...prevUser, ...updatedUser } : null));
    },
    [setUserData],
  );

  // Mark onboarding as complete
  const markOnboardingComplete = useCallback(() => {
    updateUser({ hasCompletedOnboarding: true });
  }, [updateUser]);

  // Update last login time
  const updateLastLogin = useCallback(() => {
    updateUser({ lastLoginAt: new Date().toISOString() });
  }, [updateUser]);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    removeUser();
    removeLoginStatus();
  }, [removeUser, removeLoginStatus]);

  const isAuthenticated = useCallback(() => {
    return isLoggedIn && user !== null;
  }, [isLoggedIn, user]);

  return {
    user,
    isLoggedIn,

    setAuthData,
    updateUser,
    markOnboardingComplete,
    updateLastLogin,
    clearAuthData,

    isAuthenticated: isAuthenticated(),
  };
}
