'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { LlmApiKey, LlmApiKeysResponse, GetLlmApiKeysQuery } from '@/types/llm-admin/llmApiKey';
import { ROUTES } from '@/utils/constants/routes';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getLlmApiKeyColumns } from './components/Columns';
import { CreateEditLlmApiKeyDialog } from './components/CreateEditLlmApiKeyDialog';

function AdminLlmApiKeysPage() {
    const [filters, setFilters] = useState<GetLlmApiKeysQuery>({});
    const [apiKeys, setApiKeys] = useState<LlmApiKey[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingApiKey, setEditingApiKey] = useState<LlmApiKey | null>(null);

    const fetchApiKeys = useCallback(
        async (params: GetLlmApiKeysQuery) => {
            try {
                setLoading(true);
                setError(null);

                const query = new URLSearchParams(
                    Object.entries(params).reduce((acc, [key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            acc[key] = String(value);
                        }
                        return acc;
                    }, {} as Record<string, string>)
                ).toString();

                const url = ROUTES.LLM_API_KEYS_LIST(query);
                const response: ApiResponse<LlmApiKeysResponse> = await getRequest<unknown, LlmApiKeysResponse>(url);
                
                if (response.data) {
                    setApiKeys(response.data.apiKeys || []);
                    setTotal(response.data.total || 0);
                } else {
                    setApiKeys([]);
                    setTotal(0);
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while retrieving API keys.');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchApiKeys(filters);
    }, [fetchApiKeys, filters]);

    const handleFilterChange = (newFilters: GetLlmApiKeysQuery) => {
        setFilters(newFilters);
    };

    const refetch = useCallback(() => {
        fetchApiKeys(filters);
    }, [fetchApiKeys, filters]);

    const handleEdit = (apiKey: LlmApiKey) => {
        setEditingApiKey(apiKey);
    };

    const handleDialogClose = () => {
        setCreateDialogOpen(false);
        setEditingApiKey(null);
    };

    const handleSuccess = () => {
        refetch();
        handleDialogClose();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">LLM API Keys Management</h2>
                    <p className="text-muted-foreground">
                        Manage API keys for LLM providers
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                </Button>
            </div>

            <DataTable
                columns={getLlmApiKeyColumns(refetch, handleEdit)}
                data={apiKeys}
                loading={loading}
                error={error}
                title={`API Keys (${total})`}
            />

            <CreateEditLlmApiKeyDialog
                open={createDialogOpen || editingApiKey !== null}
                onOpenChange={handleDialogClose}
                onSuccess={handleSuccess}
                apiKey={editingApiKey}
            />
        </div>
    );
}

export default withAuth(AdminLlmApiKeysPage, {
    requiredRole: 'admin',
});

