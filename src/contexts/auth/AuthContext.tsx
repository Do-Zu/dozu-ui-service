'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getRequest } from '@/api/api';
import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';
import { User, UserType } from '@/types/auth';
import { getUserType } from '@/utils/auth/redirectService';

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

    const { isLoggedIn, isAuthenticated, user, setAuthData, updateUser, clearAuthData, markOnboardingComplete } =
        useAuthStorage();

    const [currentPlanUser, setCurrentPlanUser] = useState<unknown | null>(null);

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

            const plan = await getCurrentPlanSubscription();

            if (plan) {
                setCurrentPlanUser(plan);
            }
        } catch (error) {
            console.error('Error checking authentication status:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getCurrentPlanSubscription = async () => {
        const result = await getRequest('/subscription/current-plan');
        return result;
    };

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
