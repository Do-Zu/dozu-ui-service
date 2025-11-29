export type PlanType = 'free' | 'pro';
export type BillingInterval = 'monthly' | 'yearly' | 'custom';
export type FeatureType = 'boolean' | 'usage' | 'size_limit';
export type FeatureCategory = 'core' | 'storage' | 'integrations' | 'customization';
export type FeatureUnit = 'GB' | 'MB' | 'count';
export type FeatureInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export interface Plan {
    planId: number;
    name: string;
    description?: string;
    planType: PlanType;
    billingInterval: BillingInterval;
    price: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    features?: PlanFeature[];
}

export interface Feature {
    featureId: number;
    name: string;
    description?: string;
    featureType: FeatureType;
    category: FeatureCategory;
    unit?: FeatureUnit;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt?: string;
}

export interface PlanFeature {
    planFeatureId: number;
    planId: number;
    featureId: number;
    featureName: string;
    featureDescription?: string;
    featureType: FeatureType;
    category: FeatureCategory;
    unit?: FeatureUnit;
    booleanValue?: boolean;
    numericValue?: string;
    textValue?: string;
    interval: FeatureInterval;
    apiUrl: string;
    isUnlimited: boolean;
    isEnabled: boolean;
}

export interface CreatePlanInput {
    name: string;
    description?: string;
    planType: PlanType;
    billingInterval: BillingInterval;
    price: string;
    currency?: string;
    isActive?: boolean;
}

export interface UpdatePlanInput {
    name?: string;
    description?: string;
    price?: string;
    isActive?: boolean;
}

export interface CreateFeatureInput {
    name: string;
    description?: string;
    featureType: FeatureType;
    category: FeatureCategory;
    unit?: FeatureUnit;
    isActive?: boolean;
    sortOrder?: number;
}

export interface UpdateFeatureInput {
    name?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
}

export interface AssignFeatureToPlanInput {
    planId: number;
    featureId: number;
    booleanValue?: boolean;
    numericValue?: string;
    textValue?: string;
    interval?: FeatureInterval;
    apiUrl: string;
    isUnlimited?: boolean;
    isEnabled?: boolean;
}

