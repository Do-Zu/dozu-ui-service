'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LlmApiKey } from '@/types/llm-admin/llmApiKey';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Power } from 'lucide-react';
import { ROUTES } from '@/utils/constants/routes';
import { useState } from 'react';
import { getProviderColor } from '@/utils/providerColors';
import { DeleteApiKeyDialog } from './DeleteApiKeyDialog';

function ActionButtons({
    apiKey,
    refetch,
    onEdit,
}: {
    apiKey: LlmApiKey;
    refetch: () => void;
    onEdit: (apiKey: LlmApiKey) => void;
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { execute: toggleStatus, loading: toggleLoading } = usePost(
        ROUTES.LLM_API_KEYS_TOGGLE_STATUS(apiKey.keyId),
        'PATCH',
        {
            onMessageError: () =>
                toast({ description: 'Failed to toggle status', variant: 'destructive' }),
            onMessageSuccess: () => {
                toast({ description: 'Status toggled successfully' });
                refetch();
            },
        }
    );

    const handleToggleStatus = async () => {
        await toggleStatus({});
    };

    const handleDeleteSuccess = () => {
        refetch();
    };

    return (
        <>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(apiKey)} title="Edit API key">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant={apiKey.status === 'active' ? 'secondary' : 'default'}
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={toggleLoading}
                    title={apiKey.status === 'active' ? 'Deactivate' : 'Activate'}
                >
                    <Power className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    title="Delete API key"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <DeleteApiKeyDialog
                apiKey={apiKey}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onSuccess={handleDeleteSuccess}
            />
        </>
    );
}

const getStatusBadge = (status: LlmApiKey['status']) => {
    const variants: Record<LlmApiKey['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
        active: { variant: 'default', label: 'Active' },
        inactive: { variant: 'secondary', label: 'Inactive' },
        expired: { variant: 'destructive', label: 'Expired' },
        rate_limited: { variant: 'outline', label: 'Rate Limited' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getKeyTypeBadge = (keyType: LlmApiKey['keyType']) => {
    return (
        <Badge variant={keyType === 'paid' ? 'default' : 'secondary'}>
            {keyType === 'paid' ? 'Paid' : 'Free'}
        </Badge>
    );
};

export const getLlmApiKeyColumns = (
    refetch: () => void,
    onEdit: (apiKey: LlmApiKey) => void
): ColumnDef<LlmApiKey>[] => [
    {
        accessorKey: 'keyId',
        header: 'ID',
        size: 60,
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
        accessorKey: 'keyValue',
        header: 'API Key',
        cell: ({ row }) => {
            const keyValue = row.original.keyValue;
            // Mask the key for security (show first 8 and last 4 characters)
            const masked = keyValue.length > 12 
                ? `${keyValue.substring(0, 8)}...${keyValue.substring(keyValue.length - 4)}`
                : '***';
            return (
                <div className="font-mono text-sm">
                    {masked}
                </div>
            );
        },
    },
    {
        accessorKey: 'keyType',
        header: 'Type',
        cell: ({ row }) => getKeyTypeBadge(row.original.keyType),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <span className="font-mono">{row.original.priority}</span>,
    },
    {
        accessorKey: 'isDefault',
        header: 'Default',
        cell: ({ row }) => (
            <Badge variant={row.original.isDefault ? 'default' : 'outline'}>
                {row.original.isDefault ? 'Yes' : 'No'}
            </Badge>
        ),
    },
    {
        accessorKey: 'usageLimitPerDay',
        header: 'Usage Limit/Day',
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.usageLimitPerDay ?? 'Unlimited'}
            </span>
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
        cell: ({ row }) => <ActionButtons apiKey={row.original} refetch={refetch} onEdit={onEdit} />,
    },
];

