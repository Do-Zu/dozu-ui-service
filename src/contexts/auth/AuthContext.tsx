'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';
import { getAllFeatureBelongPlan, getCurrentPlanSubscription } from '@/services/features/feature.service';
import { ICurrentPlan } from '@/services/features/feature.type';
import { User, UserType } from '@/types/auth';
import { getUserType } from '@/utils/auth/redirectService';
import { storeSessionData } from '@/utils/storage';

interface AuthContextType {
    user: User | null | undefined;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    userType: UserType;
    currentPlanUser: ICurrentPlan | null;
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

    const { isLoggedIn, isAuthenticated, user, setAuthData, updateUser, clearAuthData, markOnboardingComplete } =
        useAuthStorage();

    const [currentPlanUser, setCurrentPlanUser] = useState<ICurrentPlan | null>(null);

    const checkAuthStatus = useCallback(async () => {
        try {
            setIsLoading(true);

            if (!isLoggedIn) {
                clearAuthData();
                setCurrentPlanUser(null);
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

    const getUserCurrentPlan = useCallback(async () => {
        const { data } = await getCurrentPlanSubscription();

        const { plan } = data;

        if (!plan || !plan?.planId) {
            setCurrentPlanUser(null);
            return;
        }

        const { data: features } = await getAllFeatureBelongPlan(plan.planId);

        if (!features || features.length === 0) {
            setCurrentPlanUser(null);
            return;
        }

        const planWithFeatures = {
            plan,
            features,
        };

        storeSessionData<ICurrentPlan>('currentPlanUser', planWithFeatures);

        setCurrentPlanUser(planWithFeatures);
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        if (isAuthenticated && !currentPlanUser) {
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
    }, [user, isLoading, hasRole, hasPermission, updateUser, markOnboardingComplete, getUserCurrentPlan, currentPlanUser]);

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};