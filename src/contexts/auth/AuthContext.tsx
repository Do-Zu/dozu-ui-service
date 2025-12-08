'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStorage } from '@/app/[locale]/auth/hooks/useAuthStorage';
import { getAllFeatureBelongPlan, getCurrentPlanSubscription } from '@/services/features/feature.service';
import { ICurrentPlan } from '@/services/features/feature.type';
import { User, UserType } from '@/types/auth';
import { getUserType } from '@/utils/auth/redirectService';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationSettings } from '@/types/profile';
import { ProfileService } from '@/services/profile/profileService';
import { isEmpty, safeDestructure } from '@/utils';

interface AuthContextType {
    user: User | null | undefined;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    userType: UserType;
    currentPlanUser: ICurrentPlan | null | undefined;
    notificationSettings: NotificationSettings | null;
    setAuthData: (userData: User) => void;
    clearAuthData: () => void;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    updateUser: (userData: Partial<User>) => void;
    markOnboardingComplete: () => void;
    refreshUserPlan: () => Promise<void>;
    refreshNotificationSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { isAuthenticated, user, setAuthData, updateUser, clearAuthData, markOnboardingComplete } = useAuthStorage();

    const [currentPlanUser, setCurrentPlanUser] = useSessionStorage<ICurrentPlan | null>('currentPlanUser');

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);

    // Load notification settings
    const loadNotificationSettings = useCallback(async () => {
        if (!isAuthenticated) {
            setNotificationSettings(null);
            return;
        }

        try {
            const profile = await ProfileService.getProfile();

            if (profile.notificationSettings) {
                setNotificationSettings(profile.notificationSettings);
            } else {
                // Use default settings if not set
                setNotificationSettings({
                    dailyReminders: true,
                    weeklyReports: true,
                    achievementNotifications: true,
                    emailNotifications: true,
                    pushNotifications: true,
                });
            }
        } catch (error) {
            console.error('Failed to load notification settings:', error);

            // Use default settings on error
            setNotificationSettings({
                dailyReminders: true,
                weeklyReports: true,
                achievementNotifications: true,
                emailNotifications: true,
                pushNotifications: true,
            });
        }
    }, [isAuthenticated]);

    // Load settings when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadNotificationSettings();
        } else {
            setNotificationSettings(null);
        }
    }, [isAuthenticated, loadNotificationSettings]);

    // Initialize WebSocket connection for notifications
    // Memoize callback to prevent unnecessary re-connections
    const handleNotification = useCallback((data: any) => {
        // Additional notification handling can be added here
        console.log('Notification received in AuthContext:', data);
    }, []);

    useWebSocket({
        enabled: isAuthenticated,
        onNotification: handleNotification,
        notificationSettings: notificationSettings || undefined,
    });

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
    }, [isAuthenticated, currentPlanUser]);

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
            notificationSettings,
            setAuthData,
            clearAuthData,
            hasRole,
            hasPermission,
            updateUser,
            markOnboardingComplete,
            refreshUserPlan: getUserCurrentPlan,
            refreshNotificationSettings: loadNotificationSettings,
        };
    }, [user, isLoading, currentPlanUser, notificationSettings, clearAuthData]);

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
