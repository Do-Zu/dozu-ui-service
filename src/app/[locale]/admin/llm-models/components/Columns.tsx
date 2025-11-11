'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LlmModel } from '@/types/llmModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Power } from 'lucide-react';
import { useState } from 'react';
import { DeleteModelDialog } from './DeleteModelDialog';
import { getProviderColor } from '@/utils/providerColors';

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
    model,
    refetch,
    onEdit,
}: {
    model: LlmModel;
    refetch: () => void;
    onEdit: (model: LlmModel) => void;
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { execute: toggleAvailability, loading: toggleLoading } = usePost(
        `/admin/llm-models/${model.modelId}/toggle-availability`,
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

    const handleDeleteSuccess = () => {
        refetch();
    };

    return (
        <>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(model)} title="Edit model">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant={model.isAvailable ? 'secondary' : 'default'}
                    size="sm"
                    onClick={handleToggleAvailability}
                    disabled={toggleLoading}
                    title={model.isAvailable ? 'Disable model' : 'Enable model'}
                >
                    <Power className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    title="Delete model"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <DeleteModelDialog
                model={model}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={handleDeleteSuccess}
            />
        </>
    );
}

export const getLlmModelColumns = (
    refetch: () => void,
    onEdit: (model: LlmModel) => void
): ColumnDef<LlmModel>[] => [
    {
        accessorKey: 'modelId',
        header: 'ID',
        size: 60,
    },
    {
        accessorKey: 'name',
        header: 'Model Name',
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
        accessorKey: 'providerName',
        header: 'Provider',
        cell: ({ row }) => {
            const providerName = row.original.providerName || `Provider ${row.original.providerId}`;
            const colors = getProviderColor(providerName);
            return (
                <Badge 
                    className="text-white border-0"
                    style={{
                        background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                    }}
                >
                    {providerName}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <span className="font-mono">{row.original.priority}</span>,
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
        cell: ({ row }) => <ActionButtons model={row.original} refetch={refetch} onEdit={onEdit} />,
    },
];

