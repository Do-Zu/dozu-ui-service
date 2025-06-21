import { User } from '@/types/auth';
import { useCallback } from 'react';
import { useAuthStorage } from './useAuthStorage';

/**
 * Hook for managing user session with automatic cleanup
 */
export function useUserSession() {
  const authStorage = useAuthStorage();

  // Login with user data
  const login = useCallback(
    (userData: Omit<User, 'lastLoginAt'>) => {
      authStorage.setAuthData(userData as User);
    },
    [authStorage],
  );

  // Logout and clear data
  const logout = useCallback(() => {
    authStorage.clearAuthData();
  }, [authStorage]);

  // Update user profile
  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      authStorage.updateUser(updates);
    },
    [authStorage],
  );

  return {
    ...authStorage,
    login,
    logout,
    updateProfile,
  };
}
