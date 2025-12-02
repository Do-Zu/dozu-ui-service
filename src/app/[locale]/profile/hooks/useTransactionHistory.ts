import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/services/payment';
import { toast } from '../../../../hooks/use-toast';

export interface Transaction {
    transactionId: number;
    gateway: string;
    transactionDate: string;
    accountNumber: string | null;
    amount: string;
    currency: string;
    code: string | null;
    paymentId: string | null;
    description: string | null;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'expired' | 'cancelled';
    metadata: any;
    createdAt: string;
    updatedAt: string | null;
}

export const useTransactionHistory = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await paymentService.getPaymentHistory();
            setTransactions(data || []);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch transaction history';
            setError(errorMessage);
            toast({
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        error,
        refetch: fetchTransactions,
    };
};

