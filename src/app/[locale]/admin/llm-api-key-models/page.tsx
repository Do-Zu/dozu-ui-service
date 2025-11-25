'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { LlmApiKeyModel, LlmApiKeyModelsResponse, GetLlmApiKeyModelsQuery } from '@/types/llm-admin/llmApiKeyModel';
import { ROUTES } from '@/utils/constants/routes';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getLlmApiKeyModelColumns } from './components/Columns';
import { CreateEditLlmApiKeyModelDialog } from './components/CreateEditLlmApiKeyModelDialog';

function AdminLlmApiKeyModelsPage() {
    const [filters, setFilters] = useState<GetLlmApiKeyModelsQuery>({});
    const [relations, setRelations] = useState<LlmApiKeyModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingRelation, setEditingRelation] = useState<LlmApiKeyModel | null>(null);

    const fetchRelations = useCallback(
        async (params: GetLlmApiKeyModelsQuery) => {
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

                const url = ROUTES.LLM_API_KEY_MODELS_LIST(query);
                const response: ApiResponse<LlmApiKeyModelsResponse> = await getRequest<unknown, LlmApiKeyModelsResponse>(url);
                
                if (response.data) {
                    setRelations(response.data.relations || []);
                    setTotal(response.data.total || 0);
                } else {
                    setRelations([]);
                    setTotal(0);
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while retrieving API key-model relations.');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchRelations(filters);
    }, [fetchRelations, filters]);

    const handleFilterChange = (newFilters: GetLlmApiKeyModelsQuery) => {
        setFilters(newFilters);
    };

    const refetch = useCallback(() => {
        fetchRelations(filters);
    }, [fetchRelations, filters]);

    const handleEdit = (relation: LlmApiKeyModel) => {
        setEditingRelation(relation);
    };

    const handleDialogClose = () => {
        setCreateDialogOpen(false);
        setEditingRelation(null);
    };

    const handleSuccess = () => {
        refetch();
        handleDialogClose();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">LLM API Key-Model Relations Management</h2>
                    <p className="text-muted-foreground">
                        Manage relations between API keys and models
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Relation
                </Button>
            </div>

            <DataTable
                columns={getLlmApiKeyModelColumns(refetch, handleEdit)}
                data={relations}
                loading={loading}
                error={error}
                title={`Relations (${total})`}
            />

            <CreateEditLlmApiKeyModelDialog
                open={createDialogOpen || editingRelation !== null}
                onOpenChange={handleDialogClose}
                onSuccess={handleSuccess}
                relation={editingRelation}
            />
        </div>
    );
}

export default withAuth(AdminLlmApiKeyModelsPage, {
    requiredRole: 'admin',
});

