'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { Plan, PlanFeature } from '@/types/subscription';
import { DataTable } from '@/components/ui/data-table';
import { getFeatureColumns } from './components/Columns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { AssignFeatureDialog } from './components/AssignFeatureDialog';

function PlanFeaturesPage() {
    const params = useParams();
    const router = useRouter();
    const planId = parseInt(params.planId as string);

    const [plan, setPlan] = useState<Plan | null>(null);
    const [features, setFeatures] = useState<PlanFeature[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const fetchPlanFeatures = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [planResponse, featuresResponse] = await Promise.all([
                getRequest<unknown, Plan>(`/admin/subscription/plans/${planId}`),
                getRequest<unknown, PlanFeature[]>(`/admin/subscription/plans/${planId}/features`),
            ]);

            setPlan(planResponse.data || null);
            setFeatures(featuresResponse.data || []);
        } catch (err: any) {
            setError(err.message || 'An error occurred while retrieving plan features.');
        } finally {
            setLoading(false);
        }
    }, [planId]);

    useEffect(() => {
        fetchPlanFeatures();
    }, [fetchPlanFeatures]);

    if (!plan && !loading) {
        return <div>Plan not found</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/plans">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {plan?.name} - Features Management
                    </h2>
                    <p className="text-muted-foreground">
                        Configure features and limits for this subscription plan
                    </p>
                </div>
                <Button onClick={() => setAssignDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Feature
                </Button>
            </div>

            <DataTable
                columns={getFeatureColumns(fetchPlanFeatures)}
                data={features}
                loading={loading}
                error={error}
                title={`Features (${features.length})`}
            />

            <AssignFeatureDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                planId={planId}
                onSuccess={fetchPlanFeatures}
            />
        </div>
    );
}

export default withAuth(PlanFeaturesPage, {
    requiredRole: 'admin',
});

