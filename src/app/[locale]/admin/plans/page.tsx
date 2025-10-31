'use client';

import { useCallback, useEffect, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { Plan } from '@/types/subscription';
import { DataTable } from '@/components/ui/data-table';
import { getPlanColumns } from './components/Columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreatePlanDialog } from './components/CreatePlanDialog';

function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response: ApiResponse<Plan[]> = await getRequest<unknown, Plan[]>('/admin/subscription/plans');
            setPlans(response.data || []);
        } catch (err: any) {
            setError(err.message || 'An error occurred while retrieving plans.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Subscription Plans Management</h2>
                    <p className="text-muted-foreground">
                        Manage subscription plans, pricing, and features
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Plan
                </Button>
            </div>

            <DataTable
                columns={getPlanColumns(fetchPlans)}
                data={plans}
                loading={loading}
                error={error}
                title={`Plans (${plans.length})`}
            />

            <CreatePlanDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchPlans}
            />
        </div>
    );
}

export default withAuth(AdminPlansPage, {
    requiredRole: 'admin',
});

