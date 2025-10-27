'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Plan } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Settings, Eye } from 'lucide-react';

function PlanTypeBadge({ planType }: { planType: string }) {
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

function BillingBadge({ interval }: { interval: string }) {
    return (
        <Badge variant="outline">
            {interval === 'monthly' ? 'Monthly' : interval === 'yearly' ? 'Yearly' : interval}
        </Badge>
    );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
    return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
        </Badge>
    );
}

function ActionButtons({ plan, refetch }: { plan: Plan; refetch: () => void }) {
    const { execute: toggleActive, loading: toggleLoading } = usePost(
        `/admin/subscription/plans/${plan.planId}/toggle-active`,
        'PATCH',
        {
            onMessageError: () => toast({ description: 'Failed to toggle active', variant: 'destructive' }),
            onMessageSuccess: refetch,
        }
    );

    const handleToggleActive = async () => {
        const res = (await toggleActive({ isActive: !plan.isActive })) as { message?: string };
        if (res?.message) toast({ description: res.message, variant: 'default' });
    };

    return (
        <div className="flex gap-2">
            <Link href={`/admin/plans/${plan.planId}/features`}>
                <Button variant="outline" size="sm" title="Manage Features">
                    <Settings className="h-4 w-4" />
                </Button>
            </Link>
            <Button
                variant={plan.isActive ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggleActive}
                disabled={toggleLoading}
            >
                {plan.isActive ? 'Deactivate' : 'Activate'}
            </Button>
        </div>
    );
}

export const getPlanColumns = (refetch: () => void): ColumnDef<Plan>[] => [
    {
        accessorKey: 'planId',
        header: 'ID',
        size: 60,
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.name}</div>
                {row.original.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                        {row.original.description}
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'planType',
        header: 'Type',
        cell: ({ row }) => <PlanTypeBadge planType={row.original.planType} />,
    },
    {
        accessorKey: 'billingInterval',
        header: 'Billing',
        cell: ({ row }) => <BillingBadge interval={row.original.billingInterval} />,
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
            <span className="font-mono">
                {row.original.price} {row.original.currency}
            </span>
        ),
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => <ActiveBadge isActive={row.original.isActive} />,
    },
    {
        id: 'features',
        header: 'Features',
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
                {row.original.features?.length || 0} features
            </span>
        ),
    },
    {
        id: 'action',
        header: 'Actions',
        cell: ({ row }) => <ActionButtons plan={row.original} refetch={refetch} />,
    },
];

