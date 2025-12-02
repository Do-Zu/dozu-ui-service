'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTransactionHistory, Transaction } from '@/app/[locale]/profile/hooks/useTransactionHistory';

const TransactionHistory: React.FC = () => {
    const t = useTranslations('transactionHistory');
    const locale = useLocale();
    const { transactions, loading, error } = useTransactionHistory();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'processing':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
            case 'failed':
            case 'expired':
            case 'cancelled':
                return 'bg-destructive/10 text-destructive';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const formatAmount = (amount: string, currency: string) => {
        const numAmount = parseFloat(amount);
        const localeMap: Record<string, string> = {
            vi: 'vi-VN',
            en: 'en-US',
        };
        return new Intl.NumberFormat(localeMap[locale] || 'vi-VN', {
            style: 'currency',
            currency: currency || 'VND',
        }).format(numAmount);
    };

    const formatDate = (dateString: string) => {
        const localeMap: Record<string, string> = {
            vi: 'vi-VN',
            en: 'en-US',
        };
        return new Date(dateString).toLocaleString(localeMap[locale] || 'vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusText = (status: string) => {
        return t(`status.${status}`) || status;
    };

    if (loading) {
        return (
            <div className="bg-background rounded-lg shadow-md p-6 border border-border">
                <h2 className="text-xl font-bold mb-4 text-foreground">{t('title')}</h2>
                <div className="flex justify-center items-center py-8">
                    <div className="text-muted-foreground">{t('loading')}</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-background rounded-lg shadow-md p-6 border border-border">
                <h2 className="text-xl font-bold mb-4 text-foreground">{t('title')}</h2>
                <div className="flex justify-center items-center py-8">
                    <div className="text-destructive">{t('error')}: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background rounded-lg shadow-md p-6 border border-border">
            <h2 className="text-xl font-bold mb-4 text-foreground">{t('title')}</h2>
            
            {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>{t('noTransactions')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t('table.transactionCode')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t('table.description')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t('table.amount')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t('table.status')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t('table.transactionDate')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t('table.gateway')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                            {transactions.map((transaction: Transaction) => (
                                <tr key={transaction.transactionId} className="hover:bg-muted transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                        {transaction.code || `#${transaction.transactionId}`}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-foreground">
                                        {transaction.description || t('notAvailable')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                        {formatAmount(transaction.amount, transaction.currency)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                transaction.status
                                            )}`}
                                        >
                                            {getStatusText(transaction.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {formatDate(transaction.transactionDate || transaction.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {transaction.gateway}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;

