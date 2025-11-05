'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { Feature } from '@/types/subscription';
import { DataTable } from '@/components/ui/data-table';
import { getFeatureColumns } from './components/Columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateFeatureDialog } from './components/CreateFeatureDialog';

function AdminFeaturesPage() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const fetchFeatures = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response: ApiResponse<Feature[]> = await getRequest<unknown, Feature[]>(
                '/admin/subscription/features'
            );
            setFeatures(response.data || []);
        } catch (err: any) {
            setError(err.message || 'An error occurred while retrieving features.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeatures();
    }, [fetchFeatures]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Features Management</h2>
                    <p className="text-muted-foreground">
                        Define and manage available features for subscription plans
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Feature
                </Button>
            </div>

            <DataTable
                columns={getFeatureColumns(fetchFeatures)}
                data={features}
                loading={loading}
                error={error}
                title={`Features (${features.length})`}
            />

            <CreateFeatureDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchFeatures}
            />
        </div>
    );
}

export default withAuth(AdminFeaturesPage, {
    requiredRole: 'admin',
});

