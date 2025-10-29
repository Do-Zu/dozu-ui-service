'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { callApiAsync } from '@/hooks/helper';
import { ApiResponse } from '@/api/type';
import { PaymentsResponse } from '@/types/payment';
import { DataTable } from '@/components/ui/data-table';
import { getPaymentColumns } from './components/Columns';
import { PaymentFilter } from './components/PaymentFilter';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const fetchPayments = useCallback(
        async (params = filters) => {
            try {
                setLoading(true);
                setError(null);

                const response: ApiResponse<PaymentsResponse> = await callApiAsync(
                    '/admin/payments/transactions',
                    'GET',
                    { params }
                );
                setPayments(response.data || null);
            } catch (err: any) {
                setError(err.message || 'An error occurred while retrieving payments.');
            } finally {
                setLoading(false);
            }
        },
        [filters, refetchTrigger]
    );

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleFilterChange = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        fetchPayments(newFilters);
    };

    const handleRefetch = () => {
        setRefetchTrigger((prev) => prev + 1);
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExportCsv = async () => {
        try {
            setIsExporting(true);
            
            // Use callApiAsync with responseType: 'text' for CSV
            const csvData = await callApiAsync<string>('/admin/payments/export/csv', 'GET', {
                params: filters,
                responseType: 'text',
            });
            
            if (!csvData || csvData.trim().length === 0) {
                toast({
                    description: 'No data to export',
                    variant: 'destructive',
                });
                return;
            }

            // Create and download CSV file
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `payments-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast({ description: 'Payments exported successfully' });
        } catch (err: any) {
            toast({
                description: err?.message || 'Failed to export payments',
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Payment Tracking</h2>
                    <p className="text-muted-foreground">Monitor all transactions and payment statuses</p>
                </div>
                <Button onClick={handleExportCsv} variant="outline" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
            </div>

            <PaymentFilter onFilterChange={handleFilterChange} />

            <DataTable
                columns={getPaymentColumns(handleRefetch)}
                data={payments?.payments || []}
                loading={loading}
                error={error}
                title={`Transactions (${payments?.total || 0})`}
            />

            {payments && payments.total > payments.limit && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <span className="text-sm text-muted-foreground">
                        Page {payments.page} of {Math.ceil(payments.total / payments.limit)}
                    </span>
                </div>
            )}
        </div>
    );
}

export default withAuth(PaymentsPage, {
    requiredRole: 'admin',
});


