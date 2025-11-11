'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LlmProvider } from '@/types/llmProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Power } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
    return (
        <Badge 
            className={isAvailable 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }
        >
            {isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
    );
}

function DefaultBadge({ isDefault }: { isDefault: boolean }) {
    if (!isDefault) return null;
    return (
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            Default
        </Badge>
    );
}

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

    const { execute: deleteProvider, loading: deleteLoading } = usePost(
        `/admin/llm-providers/${provider.providerId}`,
        'DELETE',
        {
            onMessageError: () => toast({ description: 'Failed to delete provider', variant: 'destructive' }),
            onMessageSuccess: () => {
                toast({ description: 'Provider deleted successfully' });
                refetch();
                setDeleteDialogOpen(false);
            },
        }
    );

    const handleToggleAvailability = async () => {
        await toggleAvailability({});
    };

    const handleDelete = async () => {
        await deleteProvider({});
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
                    disabled={deleteLoading}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the provider{' '}
                            <strong>{provider.name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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

