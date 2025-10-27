export interface RevenueStats {
    totalRevenue: number;
    transactionCount: number;
    mrr: number; // Monthly Recurring Revenue
    arpu: number; // Average Revenue Per User
    ltv: number; // Lifetime Value
    activeProUsers: number;
    growthRate: number;
    averageTransactionValue: number;
    revenueTrend: {
        period: string;
        revenue: number;
        count: number;
    }[];
    revenueByGateway: {
        gateway: string;
        revenue: number;
        count: number;
        percentage: number;
    }[];
    revenueByPlan: {
        planType: string;
        planName: string;
        revenue: number;
        subscriberCount: number;
    }[];
}

export interface RevenueBreakdown {
    key: string;
    revenue: number;
    count: number;
}

export interface TopCustomer {
    userId: number;
    username: string;
    email: string;
    totalRevenue: number;
    transactionCount: number;
}

export type Period = 'day' | 'week' | 'month' | 'year';

