import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { useAuth } from '@/contexts/auth/AuthContext';
import { fetchPlans } from '@/stores/features/subscription';

import { Plan } from '@/components/upgrade-plan/UpgradePlanModal';
import {
    paymentService,
    PaymentData,
    PaymentStatusData,
    UpdateSubscriptionRequest,
    PaymentRegisterRequest,
} from '@/services/payment';
import useRetry from '@/hooks/useRetry';
import { toast } from '@/hooks/use-toast';
import { STATUS_CODE } from '@/utils/constants/http';
import { compareIgnoreCapitalization, isEmpty, isNilOrEmpty, safeDestructure } from '@/utils';

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

export interface IResRetry {
    status: number;
    message?: string;
}
export interface IStatusTransactionPayOSGateway {
    code: string;
    desc: string;
    data: {
        status: string;
        amountRemaining: number;
    };
}
export function usePayment(options?: UsePaymentOptions) {
    const dispatch = useAppDispatch();
    const { refreshUserPlan } = useAuth();

    const [plan, setPlan] = useState<Plan | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { plans } = useAppSelector((state) => state.subscription);

    const { execute: retryUpdateSubscription } = useRetry<IResRetry, [UpdateSubscriptionRequest]>({
        retry: async (req: UpdateSubscriptionRequest) => {
            try {
                const data = await paymentService.updateSubscription(req);

                return {
                    status: STATUS_CODE.OK,
                } as IResRetry;
            } catch (error) {
                if (error && error instanceof AxiosError) {
                    const status = error.response?.status;
                    const { message } = safeDestructure(error.response?.data);
                    if (status && status >= 400 && status < 500) {
                        toast({
                            description: message,
                        });

                        return {
                            status,
                            message: message,
                        } as IResRetry;
                    } else {
                        throw new Error(message);
                    }
                }
                throw error instanceof Error ? error : new Error('Some Thing Wrong When Payment!');
            }
        },
        options: {
            maxRetries: 3,
            delay: 1000,
            onFailureEachTry: () => {
                // optionally log or soft-notify per attempt
            },
            onFailure: (error) => {
                //TODO
            },
        },
    });

    const initializePayment = useCallback(
        async (planId: string) => {
            try {
                setIsProcessingPayment(true);

                setError(null);

                let planSource = plans;

                if (isEmpty(planSource)) {
                    planSource = await dispatch(fetchPlans()).unwrap();
                }

                if (isNilOrEmpty(planId)) {
                    toast({
                        description: 'Choose plan first!',
                    });
                }

                // Find the selected plan
                const selectedPlan = planSource?.find((p) =>
                    compareIgnoreCapitalization(p?.planId?.toString(), planId),
                );

                if (!selectedPlan) {
                    throw new Error('Choose plan first!');
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
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
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

                const { status, message } = await retryUpdateSubscription(updateRequest);

                if (status && status !== STATUS_CODE.OK) {
                    if (isEmpty(message)) {
                        throw new Error('Some thing wrong');
                    } else {
                        setError(message!);
                    }

                    toast({
                        description: message,
                        variant: 'destructive',
                    });
                    return;
                }

                toast({
                    description: 'Your subscription has been successfully updated!',
                });

                await refreshUserPlan();
            } catch {
            } finally {
                setIsUpdatingSubscription(false);
            }
        },
        [retryUpdateSubscription, options],
    );

    // const startStatusPolling = useCallback(async (apiEndPointCheckStatusTransaction: string, delay: number = 1000) => {
    //     setInterval(async () => {
    //         try {
    //             const response = await Axios.post(apiEndPointCheckStatusTransaction);

    //             const {
    //                 code,
    //                 desc,
    //                 data: transaction,
    //             } = safeDestructure(response?.data) as IStatusTransactionPayOSGateway;

    //             const CODE_SUCCESS = '00';

    //             if (!compareIgnoreCapitalization(code, CODE_SUCCESS)) {
    //             }

    //             const { status } = safeDestructure(transaction);

    //             if (status === PAYMENT_STATUS.PAID) {
    //             }
    //         } catch (error) {
    //             setError('Gateway Unavailable!');
    //         }
    //     }, delay);
    // }, []);

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
