'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';
import { getAllFeatureBelongPlan, getCurrentPlanSubscription } from '@/services/features/feature.service';
import { ICurrentPlan } from '@/services/features/feature.type';
import { User, UserType } from '@/types/auth';
import { getUserType } from '@/utils/auth/redirectService';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { SESSION_STORAGE_KEY } from '@/utils/constants/storage';
import { isEmpty, safeDestructure } from '@/utils';

interface AuthContextType {
    user: User | null | undefined;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    userType: UserType;
    currentPlanUser: ICurrentPlan | null | undefined;
    setAuthData: (userData: User) => void;
    clearAuthData: () => void;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    updateUser: (userData: Partial<User>) => void;
    markOnboardingComplete: () => void;
    refreshUserPlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { isAuthenticated, user, setAuthData, updateUser, clearAuthData, markOnboardingComplete } = useAuthStorage();

    const [currentPlanUser, setCurrentPlanUser] = useSessionStorage<ICurrentPlan | null>(
        SESSION_STORAGE_KEY.CURRENT_USER_PLAN,
    );

    const checkAuthStatus = useCallback(async () => {
        try {
            setIsLoading(true);

            if (!isAuthenticated) {
                clearAuthData();
                setCurrentPlanUser(null);
                return;
            }
        } catch (error) {
            console.error('Error checking authentication status:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const getUserCurrentPlan = useCallback(async () => {
        const { data } = await getCurrentPlanSubscription();

        const { plan, subscription } = data;

        if (!plan || !plan?.planId) {
            setCurrentPlanUser(null);
            return;
        }

        const { data: features } = await getAllFeatureBelongPlan(plan.planId);

        if (isEmpty(features)) {
            setCurrentPlanUser(null);
            return;
        }

        const { createdAt, currentPeriodEnd, currentPeriodStart, updatedAt, status } = safeDestructure(subscription);

        const subscriptionInfoCache = { createdAt, currentPeriodEnd, currentPeriodStart, updatedAt, status };

        const planWithFeatures = {
            plan,
            features,
            subscription: subscriptionInfoCache,
        };

        setCurrentPlanUser(planWithFeatures);
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        if (isAuthenticated && isEmpty(currentPlanUser)) {
            getUserCurrentPlan();
        }
    }, [isAuthenticated]);

    const hasRole = useCallback(
        (role: string): boolean => {
            return user?.roles.includes(role) ?? false;
        },
        [user?.roles],
    );

    const hasPermission = useCallback(
        (permission: string): boolean => {
            return user?.permissions?.includes(permission) ?? false;
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
            currentPlanUser,
            setAuthData,
            clearAuthData,
            hasRole,
            hasPermission,
            updateUser,
            markOnboardingComplete,
            refreshUserPlan: getUserCurrentPlan,
        };
    }, [user, isLoading, currentPlanUser, clearAuthData]);

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
