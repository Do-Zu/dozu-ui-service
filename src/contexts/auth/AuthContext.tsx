'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getRequest, postRequest } from '@/api/api';
import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';
import { User, UserType } from '@/types/auth';
import { getUserType } from '@/utils/auth/redirectService';

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
}

interface IPlanResponse {
    planId: number;
    name: string;
    description: string;
    isActive: boolean;
}
interface IPlan extends IPlanResponse {}
interface ISuccessResponse {
    subscriptionId: number;
    userId: number;
    planId: number;
    status: 'active' | 'cancelled' | 'expired' | 'pending' | 'suspended' | 'trialing';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialStart: Date | null;
    trialEnd: Date | null;
    cancelAt: Date | null;
    canceledAt: Date | null;
    cancellationReason: string | null;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    amount: string;
    currency: string;
    externalSubscriptionId: string | null;
    autoRenew: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}
interface ICurrentPlanSubscriptionResponse {
    subscription: ISuccessResponse;
    plan: IPlanResponse;
}

interface IFeatureRequest {
    planId: number;
}
interface IFeatureResponse {
    featureId: number;
    name: string;
    description: string | null;
    featureType: 'boolean' | 'usage' | 'size_limit';
    featureIntervalExpire: 'daily' | 'weekly' | 'monthly' | 'yearly';
    category: 'core' | 'storage' | 'integrations' | 'customization';
    unit: 'GB' | 'MB' | 'count' | null;
}

interface ICurrentPlan {
    plan: IPlan;
    features: IFeatureResponse[];
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

            // Get current subscription plan of user
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

            setCurrentPlanUser(planWithFeatures);
        } catch (error) {
            console.error('Error checking authentication status:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getCurrentPlanSubscription = async () => {
        const result = await getRequest<ICurrentPlanSubscriptionResponse, ICurrentPlanSubscriptionResponse>(
            '/subscription/current-plan',
        );
        return result;
    };

    const getAllFeatureBelongPlan = async (planId: number) => {
        const result = await postRequest<IFeatureRequest, IFeatureResponse[]>(`/subscription/plan/features`, {
            planId,
        });
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
            currentPlanUser,
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
