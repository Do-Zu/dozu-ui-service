import { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/stores/hooks';
import { toast } from '@/hooks/use-toast';
import { Plan } from '@/components/upgrade-plan/UpgradePlanModal';
import {
    paymentService,
    PaymentData,
    PaymentStatusData,
    UpdateSubscriptionRequest,
    PaymentRegisterRequest,
} from '@/services/payment';
import useRetry from '@/hooks/useRetry';
import { ITransactionStatusUpdate } from '@/services/payment/payment.service';

export interface PaymentResponse {
    status: string;
    message: string;
    code: number;
    data: PaymentData;
}

export interface PaymentStatusResponse {
    status: string;
    message: string;
    code: number;
    data: PaymentStatusData;
}

export interface UsePaymentOptions {
    onSubscriptionUpdated?: () => void | Promise<void>;
}

export function usePayment(options?: UsePaymentOptions) {
    const [plan, setPlan] = useState<Plan | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { plans } = useAppSelector((state) => state.subscription);

    const { execute: retryUpdateStatusTransaction } = useRetry<unknown, [ITransactionStatusUpdate]>({
        retry: (payload: ITransactionStatusUpdate) => paymentService.updateStatusTransaction(payload),
        options: {
            maxRetries: 3,
            onSuccess: () => {},
            onFailure: (error) => {},
        },
    });

    const { execute: retryUpdateSubscription } = useRetry<unknown, [UpdateSubscriptionRequest]>({
        retry: (req: UpdateSubscriptionRequest) => paymentService.updateSubscription(req),
        options: {
            maxRetries: 3,
            delay: 1000,
            onFailureEachTry: () => {
                // optionally log or soft-notify per attempt
            },
        },
    });

    const initializePayment = useCallback(
        async (planId: string) => {
            try {
                setIsProcessingPayment(true);
                setError(null);

                // Find the selected plan
                const selectedPlan = plans?.find((p) => p?.planId?.toString() === planId);

                if (!selectedPlan) {
                    throw new Error('Plan not found');
                }

                setPlan(selectedPlan);

                // Call payment register API
                const paymentRequest: PaymentRegisterRequest = {
                    planId: parseInt(planId),
                    amount: selectedPlan.price,
                    currency: selectedPlan.currency,
                    description: `PAYMENT SUBSCRIPTION PLAN - ${selectedPlan.name}`,
                };

                const paymentData = await paymentService.registerPayment(paymentRequest);
                setPaymentData(paymentData);

                // TODO: using webhook for check status payment status
                // Poll for payment status
                //startStatusPolling(paymentData.orderCode.toString());
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
                toast({
                    description: err.response?.data?.message || err.message || 'Failed to initialize payment',
                    variant: 'destructive',
                });
            } finally {
                setIsProcessingPayment(false);
            }
        },
        [plans],
    );

    const updateSubscription = useCallback(
        async (updateRequest: UpdateSubscriptionRequest) => {
            try {
                setIsUpdatingSubscription(true);

                const statusTransactionPayload = {
                    orderCode: updateRequest.orderCode,
                    paymentId: updateRequest.paymentId,
                };

                void retryUpdateStatusTransaction(statusTransactionPayload).catch((e) => {
                    console.warn('update transaction failed after retries');
                });

                await retryUpdateSubscription(updateRequest);

                toast({
                    description: 'Your subscription has been successfully updated!',
                });

                // Call callback to refresh user plan
                if (options?.onSubscriptionUpdated) {
                    await options.onSubscriptionUpdated();
                }

                // Redirect to success page or dashboard
                //window.location.href = `/payment?code=00&id=${paymentData?.paymentLinkId}&cancel=false&status=PAID&orderCode=${orderCode}`;
            } catch (err: any) {
                console.error('Subscription update error:', err);
                toast({
                    description: err.response?.data?.message || 'Failed to update subscription',
                    variant: 'destructive',
                });
            } finally {
                setIsUpdatingSubscription(false);
            }
        },
        [retryUpdateStatusTransaction, retryUpdateSubscription, options],
    );

    // Clean up polling on component unmount
    useEffect(() => {
        return () => {
            // Clean up any active polling
        };
    }, []);

    return {
        plan,
        paymentData,
        isProcessingPayment,
        isCheckingStatus,
        isUpdatingSubscription,
        error,
        initializePayment,
        updateSubscription,
    };
}
