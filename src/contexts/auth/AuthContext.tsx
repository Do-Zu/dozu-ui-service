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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  userType: UserType;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  updateUser: (userData: Partial<User>) => void;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (!isLoggedIn) {
        setUser(null);
        return;
      }

      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setUser(null);
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

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const markOnboardingComplete = useCallback(() => {
    updateUser({
      hasCompletedOnboarding: true,
      isNewUser: false,
      onboardingStep: undefined,
    });
  }, [updateUser]);

  const contextValue = useMemo(() => {
    const isAuthenticated = !!user;
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
