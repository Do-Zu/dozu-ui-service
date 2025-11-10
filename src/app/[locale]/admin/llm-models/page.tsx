'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { LlmModel, LlmModelsResponse, GetLlmModelsQuery } from '@/types/llmModel';
import { DataTable } from '@/components/ui/data-table';
import { getLlmModelColumns } from './components/Columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateEditLlmModelDialog } from './components/CreateEditLlmModelDialog';
import { LlmModelFilter } from './components/LlmModelFilter';

function AdminLlmModelsPage() {
    const [filters, setFilters] = useState<GetLlmModelsQuery>({});
    const [models, setModels] = useState<LlmModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingModel, setEditingModel] = useState<LlmModel | null>(null);
    const [total, setTotal] = useState(0);

    const fetchModels = useCallback(
        async (params = filters) => {
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

                const url = query ? `/admin/llm-models?${query}` : '/admin/llm-models';
                const response: ApiResponse<LlmModelsResponse> = await getRequest<unknown, LlmModelsResponse>(url);
                
                if (response.data) {
                    setModels(response.data.models || []);
                    setTotal(response.data.total || 0);
                } else {
                    setModels([]);
                    setTotal(0);
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while retrieving LLM models.');
            } finally {
                setLoading(false);
            }
        },
        [filters],
    );

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    const handleFilterChange = (newFilters: GetLlmModelsQuery) => {
        setFilters(newFilters);
        fetchModels(newFilters);
    };

    const handleEdit = (model: LlmModel) => {
        setEditingModel(model);
    };

    const handleDialogClose = () => {
        setCreateDialogOpen(false);
        setEditingModel(null);
    };

    const handleSuccess = () => {
        fetchModels();
        handleDialogClose();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">LLM Models Management</h2>
                    <p className="text-muted-foreground">
                        Manage LLM models, their availability, and default settings
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Model
                </Button>
            </div>

            <LlmModelFilter onFilterChange={handleFilterChange} />

            <DataTable
                columns={getLlmModelColumns(fetchModels, handleEdit)}
                data={models}
                loading={loading}
                error={error}
                title={`LLM Models (${total})`}
            />

            <CreateEditLlmModelDialog
                open={createDialogOpen || editingModel !== null}
                onOpenChange={handleDialogClose}
                onSuccess={handleSuccess}
                model={editingModel}
            />
        </div>
    );
}

export default withAuth(AdminLlmModelsPage, {
    requiredRole: 'admin',
});

