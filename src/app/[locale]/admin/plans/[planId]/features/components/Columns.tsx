'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PlanFeature } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Trash2, Check, X } from 'lucide-react';

function FeatureTypeBadge({ type }: { type: string }) {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' }> = {
        boolean: { variant: 'default' },
        usage: { variant: 'secondary' },
        size_limit: { variant: 'outline' },
    };

    return <Badge variant={variants[type]?.variant || 'outline'}>{type.replace('_', ' ')}</Badge>;
}

function CategoryBadge({ category }: { category: string }) {
    return <Badge variant="outline" className="capitalize">{category}</Badge>;
}

function FeatureValue({ feature }: { feature: PlanFeature }) {
    if (feature.isUnlimited) {
        return <span className="font-semibold text-green-600">Unlimited</span>;
    }

    if (feature.featureType === 'boolean') {
        return feature.booleanValue ? (
            <Check className="h-5 w-5 text-green-600" />
        ) : (
            <X className="h-5 w-5 text-red-600" />
        );
    }

    if (feature.featureType === 'usage' || feature.featureType === 'size_limit') {
        return (
            <span className="font-mono">
                {feature.numericValue} {feature.unit || ''}
            </span>
        );
    }

    if (feature.textValue) {
        return <span className="text-sm">{feature.textValue}</span>;
    }

    return <span className="text-muted-foreground">—</span>;
}

function ActionButtons({ feature, refetch }: { feature: PlanFeature; refetch: () => void }) {
    const { execute: removeFeature, loading } = usePost(
        `/admin/subscription/plan-features/${feature.planFeatureId}`,
        'DELETE',
        {
            onMessageError: () => toast({ description: 'Failed to remove feature', variant: 'destructive' }),
            onMessageSuccess: () => {
                toast({ description: 'Feature removed successfully' });
                refetch();
            },
        }
    );

    const handleRemove = async () => {
        if (confirm('Are you sure you want to remove this feature from the plan?')) {
            await removeFeature({});
        }
    };

    const { execute: toggleEnabled, loading: toggleLoading } = usePost(
        `/admin/subscription/plan-features/${feature.planFeatureId}`,
        'PATCH',
        {
            onMessageError: () => toast({ description: 'Failed to toggle feature', variant: 'destructive' }),
            onMessageSuccess: refetch,
        }
    );

    const handleToggle = async () => {
        await toggleEnabled({ isEnabled: !feature.isEnabled });
    };

    return (
        <div className="flex gap-2">
            <Button
                variant={feature.isEnabled ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggle}
                disabled={toggleLoading}
            >
                {feature.isEnabled ? 'Disable' : 'Enable'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

export const getFeatureColumns = (refetch: () => void): ColumnDef<PlanFeature>[] => [
    {
        accessorKey: 'featureName',
        header: 'Feature',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.featureName}</div>
                {row.original.featureDescription && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                        {row.original.featureDescription}
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'featureType',
        header: 'Type',
        cell: ({ row }) => <FeatureTypeBadge type={row.original.featureType} />,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    },
    {
        id: 'value',
        header: 'Value/Limit',
        cell: ({ row }) => <FeatureValue feature={row.original} />,
    },
    {
        accessorKey: 'interval',
        header: 'Reset Interval',
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.interval}
            </Badge>
        ),
    },
    {
        accessorKey: 'isEnabled',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.isEnabled ? 'default' : 'secondary'}>
                {row.original.isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
        ),
    },
    {
        id: 'action',
        header: 'Actions',
        cell: ({ row }) => <ActionButtons feature={row.original} refetch={refetch} />,
    },
];

