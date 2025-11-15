'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LlmProvider } from '@/types/llm-admin/llmProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Power } from 'lucide-react';
import { useState } from 'react';
import { DeleteProviderDialog } from './DeleteProviderDialog';
import { getProviderColor } from '@/utils/providerColors';
import { AvailabilityBadge, DefaultBadge } from '@/components/admin/StatusBadges';

function ActionButtons({
    provider,
    refetch,
    onEdit,
}: {
    provider: LlmProvider;
    refetch: () => void;
    onEdit: (provider: LlmProvider) => void;
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { execute: toggleAvailability, loading: toggleLoading } = usePost(
        `/admin/llm-providers/${provider.providerId}/toggle-availability`,
        'PATCH',
        {
            onMessageError: () =>
                toast({ description: 'Failed to toggle availability', variant: 'destructive' }),
            onMessageSuccess: () => {
                toast({ description: 'Availability toggled successfully' });
                refetch();
            },
        }
    );

    const handleToggleAvailability = async () => {
        await toggleAvailability({});
    };

    return (
        <>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(provider)} title="Edit provider">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant={provider.isAvailable ? 'secondary' : 'default'}
                    size="sm"
                    onClick={handleToggleAvailability}
                    disabled={toggleLoading}
                    title={provider.isAvailable ? 'Disable provider' : 'Enable provider'}
                >
                    <Power className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    title="Delete provider"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <DeleteProviderDialog
                provider={provider}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={refetch}
            />
        </>
    );
}

export const getLlmProviderColumns = (
    refetch: () => void,
    onEdit: (provider: LlmProvider) => void
): ColumnDef<LlmProvider>[] => [
    {
        accessorKey: 'providerId',
        header: 'ID',
        size: 60,
    },
    {
        accessorKey: 'name',
        header: 'Provider Name',
        cell: ({ row }) => {
            const colors = getProviderColor(row.original.name);
            return (
                <div>
                    <Badge 
                        className="text-white border-0"
                        style={{
                            background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                        }}
                    >
                        {row.original.name}
                    </Badge>
                    {row.original.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {row.original.description}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'baseUrl',
        header: 'Base URL',
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground font-mono line-clamp-1">
                {row.original.baseUrl || '—'}
            </span>
        ),
    },
    {
        accessorKey: 'index',
        header: 'Index',
        cell: ({ row }) => <span className="font-mono">{row.original.index}</span>,
    },
    {
        accessorKey: 'isAvailable',
        header: 'Status',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <AvailabilityBadge isAvailable={row.original.isAvailable} />
                <DefaultBadge isDefault={row.original.isDefault} />
            </div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt);
            return <span className="text-sm text-muted-foreground">{date.toLocaleDateString()}</span>;
        },
    },
    {
        id: 'action',
        header: 'Actions',
        cell: ({ row }) => <ActionButtons provider={row.original} refetch={refetch} onEdit={onEdit} />,
    },
];

