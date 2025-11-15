'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { LlmProvider, LlmProvidersResponse, GetLlmProvidersQuery } from '@/types/llm-admin/llmProvider';
import { DataTable } from '@/components/ui/data-table';
import { getLlmProviderColumns } from './components/Columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateEditLlmProviderDialog } from './components/CreateEditLlmProviderDialog';
import { LlmProviderFilter } from './components/LlmProviderFilter';

function AdminLlmProvidersPage() {
    const [filters, setFilters] = useState<GetLlmProvidersQuery>({});
    const [providers, setProviders] = useState<LlmProvider[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<LlmProvider | null>(null);
    const [total, setTotal] = useState(0);

    const fetchProviders = useCallback(
        async (params: GetLlmProvidersQuery) => {
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

                const url = query ? `/admin/llm-providers?${query}` : '/admin/llm-providers';
                const response: ApiResponse<LlmProvidersResponse> = await getRequest<unknown, LlmProvidersResponse>(url);
                
                if (response.data) {
                    setProviders(response.data.providers || []);
                    setTotal(response.data.total || 0);
                } else {
                    setProviders([]);
                    setTotal(0);
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while retrieving LLM providers.');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchProviders(filters);
    }, [fetchProviders, filters]);

    const handleFilterChange = (newFilters: GetLlmProvidersQuery) => {
        setFilters(newFilters);
    };

    const refetch = useCallback(() => {
        fetchProviders(filters);
    }, [fetchProviders, filters]);

    const handleEdit = (provider: LlmProvider) => {
        setEditingProvider(provider);
    };

    const handleDialogClose = () => {
        setCreateDialogOpen(false);
        setEditingProvider(null);
    };

    const handleSuccess = () => {
        refetch();
        handleDialogClose();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">LLM Providers Management</h2>
                    <p className="text-muted-foreground">
                        Manage LLM providers, their availability, and default settings
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Provider
                </Button>
            </div>

            <LlmProviderFilter onFilterChange={handleFilterChange} />

            <DataTable
                columns={getLlmProviderColumns(refetch, handleEdit)}
                data={providers}
                loading={loading}
                error={error}
                title={`LLM Providers (${total})`}
            />

            <CreateEditLlmProviderDialog
                open={createDialogOpen || editingProvider !== null}
                onOpenChange={handleDialogClose}
                onSuccess={handleSuccess}
                provider={editingProvider}
            />
        </div>
    );
}

export default withAuth(AdminLlmProvidersPage, {
    requiredRole: 'admin',
});

