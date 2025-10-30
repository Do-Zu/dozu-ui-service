export interface SubscriptionStats {
    totalUsers: number;
    totalProUsers: number;
    totalFreeUsers: number;
    conversionRate: number;
    averageDurationDays: number;
    statusBreakdown: {
        status: string;
        count: number;
    }[];
    monthlyTrend: {
        month: string;
        count: number;
    }[];
}

export interface UserSubscription {
    subscriptionId: number;
    userId: number;
    username: string;
    email: string;
    planId: number;
    planName: string;
    planType: 'free' | 'pro';
    price: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending' | 'suspended' | 'trialing';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialStart?: string;
    trialEnd?: string;
    cancelAt?: string;
    canceledAt?: string;
    cancellationReason?: string;
    autoRenew: boolean;
    createdAt: string;
}

export interface SubscriptionsResponse {
    subscriptions: UserSubscription[];
    total: number;
    page: number;
    limit: number;
}

