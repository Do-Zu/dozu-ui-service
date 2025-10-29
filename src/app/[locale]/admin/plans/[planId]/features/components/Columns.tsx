'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PlanFeature } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Trash2, Check, X } from 'lucide-react';
import { RemoveFeatureDialog } from './RemoveFeatureDialog';

function FeatureTypeBadge({ type }: { type: string }) {
    const variants: Record<string, { className: string }> = {
        boolean: { className: 'bg-blue-500' },
        usage: { className: 'bg-green-500' },
        size_limit: { className: 'bg-purple-500' },
    };

    return (
        <Badge className={`${variants[type]?.className || 'bg-gray-500'} text-white`}>
            {type.replace('_', ' ').toUpperCase()}
        </Badge>
    );
}

function CategoryBadge({ category }: { category: string }) {
    const variants: Record<string, string> = {
        core: 'bg-orange-100 text-orange-800',
        storage: 'bg-cyan-100 text-cyan-800',
        integrations: 'bg-pink-100 text-pink-800',
        customization: 'bg-indigo-100 text-indigo-800',
    };

    return (
        <Badge className={variants[category] || ''} variant="outline">
            {category.toUpperCase()}
        </Badge>
    );
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

function ActionButtons({ feature, planName, refetch }: { feature: PlanFeature; planName: string; refetch: () => void }) {
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

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
        <>
            <div className="flex gap-2">
                <Button
                    variant={feature.isEnabled ? 'destructive' : 'default'}
                    size="sm"
                    onClick={handleToggle}
                    disabled={toggleLoading}
                >
                    {feature.isEnabled ? 'Disable' : 'Enable'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveDialogOpen(true)}
                    title="Remove feature"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <RemoveFeatureDialog
                feature={feature}
                planName={planName}
                open={removeDialogOpen}
                onOpenChange={setRemoveDialogOpen}
                onSuccess={refetch}
            />
        </>
    );
}

export const getFeatureColumns = (planName: string, refetch: () => void): ColumnDef<PlanFeature>[] => [
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
        cell: ({ row }) => <ActionButtons feature={row.original} planName={planName} refetch={refetch} />,
    },
];

