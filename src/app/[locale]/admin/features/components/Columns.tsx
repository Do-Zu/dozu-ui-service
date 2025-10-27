'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Feature } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

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

function ActionButtons({ feature, refetch }: { feature: Feature; refetch: () => void }) {
    const { execute: toggleActive, loading: toggleLoading } = usePost(
        `/admin/subscription/features/${feature.featureId}`,
        'PATCH',
        {
            onMessageError: () => toast({ description: 'Failed to toggle active', variant: 'destructive' }),
            onMessageSuccess: refetch,
        }
    );

    const { execute: deleteFeature, loading: deleteLoading } = usePost(
        `/admin/subscription/features/${feature.featureId}`,
        'DELETE',
        {
            onMessageError: () => toast({ description: 'Failed to delete feature', variant: 'destructive' }),
            onMessageSuccess: () => {
                toast({ description: 'Feature deleted successfully' });
                refetch();
            },
        }
    );

    const handleToggle = async () => {
        await toggleActive({ isActive: !feature.isActive });
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this feature? This action cannot be undone.')) {
            await deleteFeature({});
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant={feature.isActive ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggle}
                disabled={toggleLoading}
            >
                {feature.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteLoading}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

export const getFeatureColumns = (refetch: () => void): ColumnDef<Feature>[] => [
    {
        accessorKey: 'featureId',
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
                    <div className="text-sm text-muted-foreground line-clamp-1">{row.original.description}</div>
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
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => row.original.unit ? <Badge variant="outline">{row.original.unit}</Badge> : '—',
    },
    {
        accessorKey: 'sortOrder',
        header: 'Order',
        size: 80,
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
                {row.original.isActive ? 'Active' : 'Inactive'}
            </Badge>
        ),
    },
    {
        id: 'action',
        header: 'Actions',
        cell: ({ row }) => <ActionButtons feature={row.original} refetch={refetch} />,
    },
];

