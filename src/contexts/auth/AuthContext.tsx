'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';

import { User, UserType } from '@/types/auth';
import { getUserType } from '@/utils/auth/redirectService';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { SESSION_STORAGE_KEY } from '@/utils/constants/storage';
import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  userType: UserType;
  setAuthData: (userData: User) => void;
  clearAuthData: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  updateUser: (userData: Partial<User>) => void;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    isLoggedIn,
    isAuthenticated,
    user,
    setAuthData,
    updateUser,
    clearAuthData,
    markOnboardingComplete,
  } = useAuthStorage();

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isLoggedIn) {
        clearAuthData();
        return;
      }

      if (!user) {
        //TODO: Refresh user data from API or session
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles.includes(role) ?? false;
    },
    [user?.roles],
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return user?.permissions.includes(permission) ?? false;
    },
    [user?.permissions],
  );

  const contextValue = useMemo(() => {
    const userType = getUserType(isAuthenticated, user);
    const isNewUser = userType === 'new_user';
    const hasCompletedOnboarding = user?.hasCompletedOnboarding ?? false;

    return {
      user,
      isLoading,
      isAuthenticated,
      isNewUser,
      hasCompletedOnboarding,
      userType,
      setAuthData,
      clearAuthData,
      hasRole,
      hasPermission,
      updateUser,
      markOnboardingComplete,
    };
  }, [user, isLoading, hasRole, hasPermission, updateUser, markOnboardingComplete]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
