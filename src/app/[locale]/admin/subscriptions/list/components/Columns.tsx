'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UserSubscription } from '@/types/subscriptionStats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, User } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
        active: { variant: 'default', className: 'bg-green-600' },
        trialing: { variant: 'default', className: 'bg-blue-600' },
        cancelled: { variant: 'destructive' },
        expired: { variant: 'secondary' },
        pending: { variant: 'outline', className: 'border-yellow-600 text-yellow-600' },
        suspended: { variant: 'outline', className: 'border-orange-600 text-orange-600' },
    };

    const config = variants[status] || variants.pending;

    return (
        <Badge variant={config.variant} className={config.className}>
            {status.toUpperCase()}
        </Badge>
    );
}

function PlanBadge({ planType }: { planType: string }) {
    const variants: Record<string, { className: string }> = {
        free: { className: 'bg-gray-500' },
        pro: { className: 'bg-gradient-to-r from-blue-600 to-purple-600' },
    };

    const config = variants[planType.toLowerCase()] || variants.free;

    return (
        <Badge className={`${config.className} text-white`}>
            {planType.toUpperCase()}
        </Badge>
    );
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getDaysRemaining(endDate: string) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}

export const getSubscriptionColumns = (): ColumnDef<UserSubscription>[] => [
    {
        accessorKey: 'subscriptionId',
        header: 'ID',
        size: 60,
    },
    {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.username}</div>
                <div className="text-sm text-muted-foreground">{row.original.email}</div>
            </div>
        ),
    },
    {
        accessorKey: 'planName',
        header: 'Plan',
        cell: ({ row }) => (
            <div className="space-y-1">
                <PlanBadge planType={row.original.planType} />
                <div className="text-xs text-muted-foreground">{row.original.planName}</div>
                <div className="text-xs font-mono">${row.original.price}</div>
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        id: 'period',
        header: 'Current Period',
        cell: ({ row }) => {
            const daysRemaining = getDaysRemaining(row.original.currentPeriodEnd);
            return (
                <div className="text-sm">
                    <div>{formatDate(row.original.currentPeriodStart)}</div>
                    <div className="text-muted-foreground">to {formatDate(row.original.currentPeriodEnd)}</div>
                    {row.original.status === 'active' && (
                        <div
                            className={`text-xs mt-1 ${daysRemaining < 7 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}
                        >
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        id: 'trial',
        header: 'Trial',
        cell: ({ row }) => {
            if (row.original.trialStart && row.original.trialEnd) {
                const trialDaysRemaining = getDaysRemaining(row.original.trialEnd);
                return (
                    <div className="text-sm">
                        <Badge variant="outline" className="mb-1">
                            Trial
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                            {trialDaysRemaining > 0 ? `${trialDaysRemaining} days left` : 'Ended'}
                        </div>
                    </div>
                );
            }
            return <span className="text-muted-foreground">—</span>;
        },
    },
    {
        accessorKey: 'autoRenew',
        header: 'Auto Renew',
        cell: ({ row }) => (
            <Badge variant={row.original.autoRenew ? 'default' : 'secondary'}>
                {row.original.autoRenew ? 'Yes' : 'No'}
            </Badge>
        ),
    },
    {
        id: 'cancelInfo',
        header: 'Cancellation',
        cell: ({ row }) => {
            if (row.original.canceledAt) {
                return (
                    <div className="text-sm">
                        <div className="text-muted-foreground">{formatDate(row.original.canceledAt)}</div>
                        {row.original.cancellationReason && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={row.original.cancellationReason}>
                                {row.original.cancellationReason}
                            </div>
                        )}
                    </div>
                );
            }
            return <span className="text-muted-foreground">—</span>;
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Subscribed',
        cell: ({ row }) => (
            <div className="text-sm">
                <div>{formatDate(row.original.createdAt)}</div>
                <div className="text-xs text-muted-foreground">
                    {Math.floor((new Date().getTime() - new Date(row.original.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </div>
            </div>
        ),
    },
    {
        id: 'action',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Link href={`/admin/users?userId=${row.original.userId}`}>
                    <Button variant="ghost" size="sm" title="View User">
                        <User className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        ),
    },
];

