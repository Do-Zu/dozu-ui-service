'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LlmApiKeyModel } from '@/types/llm-admin/llmApiKeyModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { getProviderColor } from '@/utils/providerColors';
import { DeleteApiKeyModelDialog } from './DeleteApiKeyModelDialog';

function ActionButtons({
    relation,
    refetch,
    onEdit,
}: {
    relation: LlmApiKeyModel;
    refetch: () => void;
    onEdit: (relation: LlmApiKeyModel) => void;
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteSuccess = () => {
        refetch();
    };

    return (
        <>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(relation)} title="Edit relation">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    title="Delete relation"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <DeleteApiKeyModelDialog
                relation={relation}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={handleDeleteSuccess}
            />
        </>
    );
}

export const getLlmApiKeyModelColumns = (
    refetch: () => void,
    onEdit: (relation: LlmApiKeyModel) => void
): ColumnDef<LlmApiKeyModel>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
    },
    {
        accessorKey: 'providerName',
        header: 'Provider',
        cell: ({ row }) => {
            const providerName = row.original.providerName || 'Unknown';
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
        accessorKey: 'modelName',
        header: 'Model',
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.modelName || `Model ${row.original.modelId}`}
            </div>
        ),
    },
    {
        accessorKey: 'apiKeyId',
        header: 'API Key ID',
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.apiKeyId}</span>,
    },
    {
        accessorKey: 'requestPerMinute',
        header: 'Requests/Min',
        cell: ({ row }) => (
            <span className="font-mono">{row.original.requestPerMinute}</span>
        ),
    },
    {
        accessorKey: 'requestPerDay',
        header: 'Requests/Day',
        cell: ({ row }) => (
            <span className="font-mono">{row.original.requestPerDay}</span>
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
        cell: ({ row }) => <ActionButtons relation={row.original} refetch={refetch} onEdit={onEdit} />,
    },
];

