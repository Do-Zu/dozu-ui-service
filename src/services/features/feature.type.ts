export interface IPlanResponse {
    planId: number;
    name: string;
    description: string;
    isActive: boolean;
    planType: string;
    tier: number
}

export interface IPlan extends IPlanResponse { }

export interface ISuccessResponse {
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

export interface ICurrentPlanSubscriptionResponse {
    subscription: ISuccessResponse;
    plan: IPlanResponse;
}

export interface IFeatureRequest {
    planId: number;
}
export interface IFeatureResponse {
    featureId: number;
    name: string;
    description: string | null;
    featureType: 'boolean' | 'usage' | 'size_limit';
    featureIntervalExpire: 'daily' | 'weekly' | 'monthly' | 'yearly';
    category: 'core' | 'storage' | 'integrations' | 'customization';
    unit: 'GB' | 'MB' | 'count' | null;
    apiUrl: string | null;
}

export interface ICurrentPlan {
    plan: IPlan;
    features: IFeatureResponse[];
}
