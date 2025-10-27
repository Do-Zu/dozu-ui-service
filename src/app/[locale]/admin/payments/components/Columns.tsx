'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Payment } from '@/types/payment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefundDialog } from './RefundDialog';
import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
        success: { variant: 'default', className: 'bg-green-600' },
        pending: { variant: 'outline', className: 'border-yellow-600 text-yellow-600' },
        processing: { variant: 'outline', className: 'border-blue-600 text-blue-600' },
        failed: { variant: 'destructive' },
        cancelled: { variant: 'secondary' },
        expired: { variant: 'secondary', className: 'bg-gray-600' },
    };

    const config = variants[status] || variants.pending;

    return (
        <Badge variant={config.variant} className={config.className}>
            {status.toUpperCase()}
        </Badge>
    );
}

function GatewayBadge({ gateway }: { gateway: string }) {
    const colors: Record<string, string> = {
        stripe: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        paypal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        momo: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        payos: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        sepay: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };

    return (
        <Badge variant="outline" className={colors[gateway.toLowerCase()] || ''}>
            {gateway.toUpperCase()}
        </Badge>
    );
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function ActionButtons({ payment, refetch }: { payment: Payment; refetch: () => void }) {
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    
    const isRefunded = payment.metadata?.refunded;
    const canRefund = payment.status === 'success' && !isRefunded;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: `${label} copied to clipboard` });
    };

    return (
        <div className="flex gap-2">
            {payment.code && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(payment.code!, 'Transaction code')}
                    title="Copy transaction code"
                >
                    <Copy className="h-4 w-4" />
                </Button>
            )}
            
            {canRefund && (
                <>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRefundDialogOpen(true)}
                    >
                        Refund
                    </Button>
                    <RefundDialog
                        payment={payment}
                        open={refundDialogOpen}
                        onOpenChange={setRefundDialogOpen}
                        onSuccess={refetch}
                    />
                </>
            )}
            
            {isRefunded && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Refunded
                </Badge>
            )}
        </div>
    );
}

export const getPaymentColumns = (refetch: () => void): ColumnDef<Payment>[] => [
    {
        accessorKey: 'transactionId',
        header: 'ID',
        size: 60,
    },
    {
        accessorKey: 'transactionDate',
        header: 'Date',
        cell: ({ row }) => (
            <div className="text-sm">
                {formatDate(row.original.transactionDate)}
            </div>
        ),
    },
    {
        accessorKey: 'email',
        header: 'User',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.username || '—'}</div>
                <div className="text-sm text-muted-foreground">{row.original.email}</div>
            </div>
        ),
    },
    {
        accessorKey: 'gateway',
        header: 'Gateway',
        cell: ({ row }) => <GatewayBadge gateway={row.original.gateway} />,
    },
    {
        id: 'transaction',
        header: 'Transaction',
        cell: ({ row }) => (
            <div className="space-y-1">
                {row.original.code && (
                    <div className="text-xs font-mono text-muted-foreground">
                        Code: {row.original.code}
                    </div>
                )}
                {row.original.paymentId && (
                    <div className="text-xs font-mono text-muted-foreground">
                        ID: {row.original.paymentId}
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
            <div className="font-semibold">
                {parseFloat(row.original.amount).toLocaleString()} {row.original.currency}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate text-sm text-muted-foreground" title={row.original.description}>
                {row.original.description || '—'}
            </div>
        ),
    },
    {
        id: 'action',
        header: 'Actions',
        cell: ({ row }) => <ActionButtons payment={row.original} refetch={refetch} />,
    },
];


