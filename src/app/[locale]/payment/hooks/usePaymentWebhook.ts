import { useEventSource } from '@/hooks/useEventSource';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useRef, useCallback, useState } from 'react';
import { UpdateSubscriptionRequest } from '@/services/payment';

export interface PaymentStatusUpdate {
    orderCode: number | string;
    status: 'PAID' | 'CANCELLED' | 'PENDING';
    paymentLinkId?: string;
    transactionDateTime?: string;
    description?: string;
    currency?: string;
}

export interface UsePaymentWebhookOptions {
    orderCode?: number | string;
    onStatusUpdate?: (update: PaymentStatusUpdate) => void;
    onError?: (error: string) => void;
    enabled?: boolean;
    jobId?: string;
    retryAttempt?: number; // Add retry attempt tracking
}
interface ISseDataSePaymentWebhook {
    jobId: string;
    timestamp: string;
    status: string;
    data?: {
        planId: number;
        orderCode?: number;
        status: string;
    };
}
/**
 * Hook for real-time payment status updates via webhook notifications
 * This can be extended to use WebSocket, SSE, or polling based on your infrastructure
 */
export function usePaymentWebhook({
    orderCode,
    onStatusUpdate,
    onError,
    enabled = true,
    jobId,
    retryAttempt = 0,
}: UsePaymentWebhookOptions) {
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [isStartSSE, setIsStartSSE] = useState<boolean>(false);

    const urlEventSource = () => {
        if (!orderCode || !enabled || !isStartSSE || !jobId) return null;
        return `/payment/sse/${jobId}`;
    };

    const {
        data: sseData,
        status: sseStatus,
        eventSourceRef,
    } = useEventSource<ISseDataSePaymentWebhook>(urlEventSource());

    // Handle SSE connection errors
    useEffect(() => {
        if (sseStatus === 'error' || sseStatus === 'timeout') {
            if (onError) {
                onError(`SSE connection failed (attempt ${retryAttempt + 1})`);
            }
        }
    }, [sseStatus, onError, retryAttempt]);

    // For now, we'll implement polling as a fallback
    // In a production environment, you'd want to use WebSocket or SSE
    const startPolling = useCallback(() => {
        if (!orderCode || !enabled) return;

        const pollPaymentStatus = async () => {
            try {
                const response = await fetch(`/api/payment/status/${orderCode}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status && onStatusUpdate) {
                        onStatusUpdate({
                            orderCode,
                            status: data.status,
                            transactionDateTime: data.transactionDateTime,
                            description: data.description,
                            currency: data.currency,
                        });
                    }
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
                if (onError) {
                    onError('Failed to check payment status');
                }
            }
        };

        // Poll every 5 seconds
        pollingIntervalRef.current = setInterval(pollPaymentStatus, 5000);
    }, [orderCode, enabled, onStatusUpdate, onError]);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    // Server-Sent Events implementation
    const startSSE = useCallback(() => {
        if (!orderCode || !enabled) return;

        setIsStartSSE(true);
    }, [orderCode, enabled, onStatusUpdate, onError]);

    const stopSSE = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (sseStatus === 'completed' && sseData?.data) {
            const { data } = sseData;
            const update: PaymentStatusUpdate = {
                orderCode: orderCode || 0,
                status: data.status as 'PAID' | 'CANCELLED' | 'PENDING',
            };
            if (onStatusUpdate) {
                onStatusUpdate(update);
            }
        }
    }, [sseStatus, sseData, orderCode, onStatusUpdate]);

    // Start monitoring when enabled and orderCode is available
    useEffect(() => {
        if (enabled && orderCode) {
            startSSE();
        }

        return () => {
            stopPolling();
            stopSSE();
        };
    }, [enabled, orderCode, startSSE, stopSSE]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
            stopSSE();
        };
    }, [stopPolling, stopSSE]);

    return {
        startPolling,
        stopPolling,
        startSSE,
        stopSSE,
        data: sseData?.data,
        status: sseStatus,
        eventSourceRef,
    };
}
