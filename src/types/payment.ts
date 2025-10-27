export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'expired' | 'cancelled';

export interface Payment {
    transactionId: number;
    userId: number;
    username: string;
    email: string;
    gateway: string;
    transactionDate: string;
    accountNumber?: string;
    amount: string;
    currency: string;
    code?: string;
    paymentId?: string;
    description?: string;
    status: PaymentStatus;
    metadata?: any;
    createdAt: string;
    updatedAt?: string;
}

export interface PaymentsResponse {
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
}

export interface PaymentStats {
    statusBreakdown: {
        status: string;
        count: number;
        totalAmount: number;
    }[];
    gatewayBreakdown: {
        gateway: string;
        count: number;
        totalAmount: number;
    }[];
    failedCount: number;
}


