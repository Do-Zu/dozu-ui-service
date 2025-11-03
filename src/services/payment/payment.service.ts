import { postRequest, getRequest } from '@/api/api';

export interface PaymentRegisterRequest {
    planId: number;
    amount: number | string;
    currency: string;
    description: string;
}

export interface PaymentData {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
    baseUrlRedirect: string;
    jobId: string;
    transactionId: number;
}

export interface PaymentStatusRequest {
    orderCode: string;
}

export interface PaymentStatusData {
    id: string;
    orderCode: number;
    amount: number;
    status: 'PAID' | 'PENDING' | 'CANCELLED';
    currency: string;
    paymentLinkId: string;
    checkoutUrl: string;
    transactions: any[];
}

export interface IPaymentResponseSePayRegister {
    orderCode: number | string;
    amount: number;
    currency: string;
    qrCode: string;
    expireAt?: string;
    jobId: string;
    transactionId?: number;
}

export interface UpdateSubscriptionRequest {
    planId: string | number | null;
    orderCode: string | number;
    paymentStatus?: string;
    paymentId: string;
    transactionId?: number;
}

export interface WebhookRegistrationRequest {
    webhookUrl: string;
}

export interface PaymentWebhookData {
    orderCode: number;
    status: 'PAID' | 'CANCELLED' | 'PENDING';
    amount: number;
    paymentLinkId: string;
    transactionDateTime?: string;
    description?: string;
    currency?: string;
}

export interface ITransactionStatusUpdate {
    planId?: number;
    orderCode: number | string;
    paymentId: string;
}

class PaymentService {
    /**
     * Register a new payment with PayOS
     */
    async registerPayment(request: PaymentRegisterRequest): Promise<PaymentData> {
        const response = await postRequest<PaymentRegisterRequest, PaymentData>('/payment/register', request);
        return response.data;
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus(orderCode: string): Promise<PaymentStatusData> {
        const response = await postRequest<PaymentStatusRequest, PaymentStatusData>('/payment/status', { orderCode });
        return response.data;
    }

    /**
     * Update subscription after successful payment
     */
    async updateSubscription(request: UpdateSubscriptionRequest): Promise<any> {
        const response = await postRequest<UpdateSubscriptionRequest, any>('/subscription/change', request);
        return response.data;
    }

    /**
     * Get payment history for user
     */
    async getPaymentHistory(): Promise<any> {
        const response = await getRequest<any, any>('/payment/history');
        return response.data;
    }

    /**
     * Cancel payment
     */
    async cancelPayment(orderCode: string): Promise<any> {
        const response = await postRequest<{ orderCode: string }, any>('/payment/cancel', { orderCode });
        return response.data;
    }

    async updateStatusTransaction(payload: ITransactionStatusUpdate) {
        const response = await postRequest<ITransactionStatusUpdate, unknown>('/payment/status/transaction', payload);
        return response.data;
    }
}

export const paymentService = new PaymentService();
export default PaymentService;
